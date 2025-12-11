import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useShare } from '@src/contexts/ShareContext';
import { useRooms } from '@src/hooks/useRoomApi';
import { useAuth } from '@src/contexts/AuthContext';
import { colors, spacing, typography, sizes } from '@src/theme';
import { Room } from '@src/api/types';
import { IconBack, IconForward } from '@src/assets/icons';

const ShareVideoScreen = () => {
  const router = useRouter();
  const { sharedVideo, clearSharedVideo } = useShare();
  const { rooms, loading, refetch } = useRooms();
  const { user } = useAuth();

  // 공유된 비디오가 없으면 홈으로 이동
  useEffect(() => {
    if (!sharedVideo) {
      router.replace('/');
    }
  }, [sharedVideo]);

  const handleSelectRoom = (room: Room) => {
    if (!sharedVideo) return;

    // 방으로 이동하면서 공유된 비디오 정보 전달
    router.push({
      pathname: '/room/[id]',
      params: {
        id: room.id,
        sharedVideoId: sharedVideo.videoId,
      },
    });

    // 공유 상태 초기화
    clearSharedVideo();
  };

  const handleCancel = () => {
    clearSharedVideo();
    router.replace('/');
  };

  const renderRoomItem = ({ item }: { item: Room }) => {
    const memberCount = item.members ? Object.keys(item.members).length : 0;

    return (
      <TouchableOpacity
        style={styles.roomItem}
        onPress={() => handleSelectRoom(item)}
        activeOpacity={0.7}
      >
        <View style={styles.roomInfo}>
          <Text style={styles.roomName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.description && (
            <Text style={styles.roomDescription} numberOfLines={1}>
              {item.description}
            </Text>
          )}
          <Text style={styles.memberCount}>
            {memberCount}명 참여 중
          </Text>
        </View>
        <View style={styles.roomArrow}>
          <IconForward width={20} height={20} color={colors.textMuted} />
        </View>
      </TouchableOpacity>
    );
  };

  if (!sharedVideo) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <IconBack width={24} height={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>방 선택</Text>
        <View style={styles.headerRight} />
      </View>

      {/* 공유된 비디오 미리보기 */}
      <View style={styles.videoPreview}>
        <Image
          source={{ uri: sharedVideo.thumbnail }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.videoInfo}>
          <Text style={styles.videoLabel}>공유할 영상</Text>
          <Text style={styles.videoId} numberOfLines={1}>
            ID: {sharedVideo.videoId}
          </Text>
        </View>
      </View>

      {/* 안내 문구 */}
      <Text style={styles.instruction}>
        영상을 추가할 방을 선택하세요
      </Text>

      {/* 방 목록 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : rooms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>참여 중인 방이 없습니다</Text>
          <Text style={styles.emptySubText}>
            먼저 방을 만들거나 참여해주세요
          </Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          renderItem={renderRoomItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  headerRight: {
    width: 32,
  },
  videoPreview: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  thumbnail: {
    width: 120,
    height: 68,
    borderRadius: sizes.radiusSm,
    backgroundColor: colors.backgroundElevated,
  },
  videoInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  videoLabel: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  videoId: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  instruction: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    padding: spacing.lg,
    borderRadius: sizes.radiusMd,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  roomDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  memberCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
  roomArrow: {
    marginLeft: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

export default ShareVideoScreen;
