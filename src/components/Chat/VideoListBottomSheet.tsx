import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { colors, spacing, sizes, typography } from '@src/theme';
import { scaleHeight } from '@src/DeviceScale';
import { VideoList } from '@src/components/VideoList/VideoList';
import { CloseIcon } from '@src/components/Icons';
import { IconSearch, IconAdd } from '@src/assets/icons';
import { VideoData } from '@src/types/VideoData';

interface VideoListBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  videos: VideoData[];
  onVideoSelect: (video: VideoData) => void;
  currentVideoId?: string;
  onAddVideoPress?: () => void;
  onVideoDelete?: (video: VideoData) => void;
  canDelete?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.6;
const SWIPE_THRESHOLD = SHEET_HEIGHT * 0.5; // 시트 높이의 50% 드래그 시 닫힘

export const VideoListBottomSheet = ({
  visible,
  onClose,
  videos,
  onVideoSelect,
  currentVideoId,
  onAddVideoPress,
  onVideoDelete,
  canDelete = false,
}: VideoListBottomSheetProps) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // 제스처 애니메이션
  const translateY = useSharedValue(0);

  // 드래그 제스처
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // 아래로만 드래그 가능
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      // 아래 방향으로 임계값 이상 드래그했을 때만 닫기
      if (event.translationY > 0 && event.translationY > SWIPE_THRESHOLD) {
        runOnJS(onClose)();
        translateY.value = 0; // 리셋
      } else {
        // 원래 위치로 스냅백
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
        });
      }
    });

  // 애니메이션 스타일
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // 검색어로 영상 필터링
  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos;

    const query = searchQuery.toLowerCase();
    return videos.filter(video =>
      video.title.toLowerCase().includes(query) ||
      video.channelName.toLowerCase().includes(query)
    );
  }, [videos, searchQuery]);

  // 검색 기능 사용 가능 여부 (10개 이상일 때만)
  const canSearch = videos.length >= 10;

  const handleVideoSelect = (video: VideoData) => {
    onVideoSelect(video);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Animated.View
            style={[styles.sheet, { paddingBottom: insets.bottom }, animatedStyle]}
          >
            <GestureDetector gesture={panGesture}>
              <View style={styles.header}>
                <View style={styles.handle} />
                <View style={styles.headerContent}>
                <Text style={styles.title}>영상 목록</Text>
                <View style={styles.iconButtons}>
                {/* 검색 버튼 (10개 이상일 때만 표시) */}
                {canSearch && (
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => {
                      setIsSearchVisible(!isSearchVisible);
                      if (isSearchVisible) {
                        setSearchQuery('');
                      }
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <IconSearch width={24} height={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
                {/* YouTube 추가 버튼 */}
                {onAddVideoPress && (
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => {
                      onClose();
                      onAddVideoPress();
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <IconAdd width={24} height={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
                {/* 닫기 버튼 */}
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={onClose}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <CloseIcon size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          </GestureDetector>

          {/* 검색바 (토글 방식) */}
          {isSearchVisible && (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="영상 제목 또는 채널명 검색..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setSearchQuery('')}
                >
                  <CloseIcon size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* 검색 결과 표시 */}
          {isSearchVisible && searchQuery.length > 0 && (
            <View style={styles.searchResultInfo}>
              <Text style={styles.searchResultText}>
                {filteredVideos.length}개의 검색 결과
              </Text>
            </View>
          )}

          <View style={styles.listContainer}>
            <VideoList
              videos={filteredVideos}
              onVideoSelect={handleVideoSelect}
              currentVideoId={currentVideoId}
              onVideoDelete={onVideoDelete}
              canDelete={canDelete}
            />
          </View>
        </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.backgroundCard,
    borderTopLeftRadius: sizes.radiusLg,
    borderTopRightRadius: sizes.radiusLg,
    height: SHEET_HEIGHT,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  iconButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: sizes.radiusMd,
    backgroundColor: colors.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
    minHeight: scaleHeight(200),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundElevated,
    borderRadius: sizes.radiusMd,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  clearButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  searchResultInfo: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  searchResultText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
