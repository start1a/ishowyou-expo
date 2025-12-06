import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRooms } from '@src/hooks/useRoomApi';
import { Room } from '@src/api/types';
import { colors, spacing, sizes } from '@src/theme';

interface RoomListProps {
  onRoomSelect?: (room: Room) => void;
}

export const RoomList = ({ onRoomSelect }: RoomListProps) => {
  const { rooms, loading, error, refetch } = useRooms();

  const renderRoom = ({ item }: { item: Room }) => (
    <TouchableOpacity
      style={styles.roomItem}
      onPress={() => onRoomSelect?.(item)}
    >
      <View style={styles.roomHeader}>
        <Text style={styles.roomName}>{item.name}</Text>
        {item.isPrivate && (
          <View style={styles.privateIndicator}>
            <Text style={styles.privateText}>🔒</Text>
          </View>
        )}
      </View>

      {item.description && (
        <Text style={styles.roomDescription}>{item.description}</Text>
      )}

      <View style={styles.roomFooter}>
        <Text style={styles.memberCount}>
          {item.currentMembers}/{item.maxMembers} 명
        </Text>
        <Text style={styles.createdDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>방 목록을 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>오류: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (rooms.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>아직 생성된 방이 없습니다.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={rooms}
      renderItem={renderRoom}
      keyExtractor={(item) => item.id}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      onRefresh={refetch}
      refreshing={loading}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
  },
  roomItem: {
    backgroundColor: colors.backgroundLight,
    borderRadius: sizes.radiusMd,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: colors.backgroundDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
  },
  privateIndicator: {
    backgroundColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: sizes.radiusMd,
  },
  privateText: {
    fontSize: 12,
  },
  roomDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  createdDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: sizes.radiusSm,
  },
  retryButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
