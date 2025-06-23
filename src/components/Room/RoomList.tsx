import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRooms } from '@src/hooks/useRoomApi';
import { Room } from '@src/api/types';

interface RoomListProps {
  onRoomSelect?: (room: Room) => void;
}

export const RoomList: React.FC<RoomListProps> = ({ onRoomSelect }) => {
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
    padding: 16,
  },
  roomItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  privateIndicator: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  privateText: {
    fontSize: 12,
  },
  roomDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
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
    color: '#007AFF',
  },
  createdDate: {
    fontSize: 12,
    color: '#999',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
