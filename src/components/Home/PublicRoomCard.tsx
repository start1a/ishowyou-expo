import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Room } from '@src/api/types';
import { colors, spacing, typography, sizes } from '@src/theme';
import { VideoUtils } from '@src/utils/VideoUtils';

interface PublicRoomCardProps {
  room: Room;
  onPress: (room: Room) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// 기본 썸네일 placeholder
const DEFAULT_THUMBNAIL = 'https://img.youtube.com/vi/default/mqdefault.jpg';

const PublicRoomCard = ({ room, onPress }: PublicRoomCardProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  // 썸네일 URL 결정
  const getThumbnail = () => {
    // 현재 재생 중인 비디오가 있으면 그 썸네일 사용
    if (room.videoState?.videoId) {
      return VideoUtils.getThumbnailUrl(room.videoState.videoId, 'medium');
    }
    // 비디오 리스트에 비디오가 있으면 첫 번째 썸네일 사용
    if (room.videos && room.videos.length > 0) {
      return room.videos[0].thumbnail || VideoUtils.getThumbnailUrl(room.videos[0].videoId, 'medium');
    }
    return DEFAULT_THUMBNAIL;
  };

  // 멤버 수 계산
  const memberCount = room.members ? Object.keys(room.members).length : 0;

  // 생성 시간 포맷
  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
  };

  return (
    <AnimatedPressable
      style={[styles.container, animatedStyle]}
      onPress={() => onPress(room)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {/* 썸네일 영역 */}
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: getThumbnail() }}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        {/* 비공개 방 표시 */}
        {room.isPrivate && (
          <View style={styles.privateBadge}>
            <Text style={styles.privateIcon}>🔒</Text>
          </View>
        )}
      </View>

      {/* 콘텐츠 영역 */}
      <View style={styles.contentContainer}>
        <Text style={styles.roomName} numberOfLines={1}>
          {room.name}
        </Text>

        {room.description && (
          <Text style={styles.description} numberOfLines={1}>
            {room.description}
          </Text>
        )}

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>👥</Text>
            <Text style={styles.metaText}>{memberCount}명</Text>
          </View>
          <Text style={styles.metaSeparator}>•</Text>
          <Text style={styles.metaText}>{formatTimeAgo(room.createdAt)}</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
};

export default PublicRoomCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundCard,
    borderRadius: sizes.radiusLg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  thumbnailContainer: {
    aspectRatio: 16 / 9,
    backgroundColor: colors.backgroundElevated,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  privateBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: sizes.radiusSm,
    padding: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  privateIcon: {
    fontSize: 14,
  },
  contentContainer: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  roomName: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaIcon: {
    fontSize: 12,
  },
  metaText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  metaSeparator: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
