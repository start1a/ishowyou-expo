import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { scaleHeight, scaleWidth } from '@src/DeviceScale';
import { Room } from '@src/api/types';
import { VideoUtils } from '@src/utils/VideoUtils';
import { colors, spacing, typography, sizes, shadows } from '@src/theme';
import { IconForward, IconPlay, IconUser } from '@src/assets/icons';

interface CurrentRoomCardProps {
  room: Room;
  onPress: (room: Room) => void;
}

const CurrentRoomCard = ({ room, onPress }: CurrentRoomCardProps) => {
  // 현재 재생 중인 영상 정보 (videoState 없으면 첫 번째 영상 사용)
  const currentVideoId = room.videoState?.videoId;
  const currentVideo = currentVideoId
    ? room.videos?.find(v => v.videoId === currentVideoId)
    : room.videos?.[0];

  // 썸네일: 저장된 thumbnail > videoId로 생성 > null
  const thumbnailUrl = currentVideo?.thumbnail
    || (currentVideo?.videoId ? VideoUtils.getThumbnailUrl(currentVideo.videoId, 'medium') : null);

  // 멤버 수
  const memberCount = room.members ? Object.keys(room.members).length : 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(room)}
      activeOpacity={0.7}
    >
      {/* 썸네일 */}
      <View style={styles.thumbnailContainer}>
        {thumbnailUrl ? (
          <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <IconPlay width={20} height={20} color={colors.textMuted} />
          </View>
        )}
        {/* 재생 중 표시 */}
        {room.videoState?.isPlaying && (
          <View style={styles.playingIndicator}>
            <View style={styles.playingDot} />
          </View>
        )}
      </View>

      {/* 방 정보 */}
      <View style={styles.infoContainer}>
        <Text style={styles.roomName} numberOfLines={1}>
          {room.name}
        </Text>
        <Text style={styles.videoTitle} numberOfLines={1}>
          {currentVideo?.title || '재생 중인 영상 없음'}
        </Text>
        <View style={styles.memberBadge}>
          <IconUser width={12} height={12} color={colors.textMuted} />
          <Text style={styles.memberCount}>{memberCount}</Text>
        </View>
      </View>

      {/* 진입 화살표 */}
      <View style={styles.arrowContainer}>
        <IconForward width={20} height={20} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
};

export default CurrentRoomCard;

const CARD_MIN_HEIGHT = scaleHeight(56);
const THUMBNAIL_WIDTH = scaleWidth(80);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: CARD_MIN_HEIGHT,
    backgroundColor: colors.surfaceCard,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: sizes.radiusMd,
    borderWidth: 1,
    borderColor: colors.primary,
    ...shadows.sm,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    width: THUMBNAIL_WIDTH,
    alignSelf: 'stretch',
    backgroundColor: '#000',
    minHeight: CARD_MIN_HEIGHT,
  },
  thumbnail: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingIndicator: {
    position: 'absolute',
    bottom: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.success,
    borderRadius: sizes.radiusFull,
    padding: 3,
  },
  playingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textOnPrimary,
  },
  infoContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
  },
  roomName: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  videoTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  memberCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
  arrowContainer: {
    paddingRight: spacing.md,
  },
});
