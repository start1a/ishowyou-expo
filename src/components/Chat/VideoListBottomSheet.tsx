import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, sizes, typography } from '@src/theme';
import { scaleHeight } from '@src/DeviceScale';
import { VideoList } from '@src/components/VideoList/VideoList';
import { CloseIcon } from '@src/components/Icons';
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
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <View style={styles.handle} />
            <View style={styles.headerContent}>
              <Text style={styles.title}>영상 목록</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <CloseIcon size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* YouTube에서 추가 버튼 */}
          {onAddVideoPress && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                onClose();
                onAddVideoPress();
              }}
            >
              <Text style={styles.addButtonText}>+ YouTube에서 영상 추가</Text>
            </TouchableOpacity>
          )}

          <View style={styles.listContainer}>
            <VideoList
              videos={videos}
              onVideoSelect={handleVideoSelect}
              currentVideoId={currentVideoId}
              onVideoDelete={onVideoDelete}
              canDelete={canDelete}
            />
          </View>
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
  closeButton: {
    padding: spacing.xs,
  },
  listContainer: {
    flex: 1,
    minHeight: scaleHeight(200),
  },
  addButton: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: sizes.radiusMd,
    alignItems: 'center',
  },
  addButtonText: {
    ...typography.bodyMedium,
    color: colors.textOnPrimary,
  },
});
