import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRoom } from '@src/hooks/useRoomApi';
import { useMember } from '@src/hooks/useMemberApi';
import { MemberList } from '@src/components/Member';
import { RoomService } from '@src/api';

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { room, loading, error, refetch } = useRoom(id || '');
  const { updateOnlineStatus } = useMember();
    
  // 현재 사용자 ID (실제로는 인증 시스템에서 가져와야 함)
  const [currentUserId] = useState('current-user-id');
  const [currentUserRole, setCurrentUserRole] = useState<'owner' | 'admin' | 'member'>('member');

  useEffect(() => {
    if (room) {
      const currentMember = room.members.find(m => m.id === currentUserId);
      if (currentMember) {
        setCurrentUserRole(currentMember.role);
        // 온라인 상태 업데이트
        updateOnlineStatus(currentUserId, true);
      }
    }

    // 컴포넌트 언마운트 시 오프라인 상태로 변경
    return () => {
      updateOnlineStatus(currentUserId, false);
    };
  }, [room, currentUserId]);

  const handleLeaveRoom = () => {
    Alert.alert(
      '방 나가기',
      '정말로 방을 나가시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '나가기',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await RoomService.leaveRoom(id || '', currentUserId);
              if (response.success) {
                router.back();
              } else {
                Alert.alert('오류', response.error || '방 나가기에 실패했습니다.');
              }
            } catch (error) {
              Alert.alert('오류', '네트워크 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteRoom = () => {
    Alert.alert(
      '방 삭제',
      '정말로 방을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await RoomService.deleteRoom(id || '');
              if (response.success) {
                Alert.alert('완료', '방이 삭제되었습니다.', [
                  { text: '확인', onPress: () => router.back() }
                ]);
              } else {
                Alert.alert('오류', response.error || '방 삭제에 실패했습니다.');
              }
            } catch (error) {
              Alert.alert('오류', '네트워크 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>방 정보를 불러오는 중...</Text>
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

  if (!room) {
    return (
      <View style={styles.centerContainer}>
        <Text>방을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const isAdmin = currentUserRole === 'owner' || currentUserRole === 'admin';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.roomInfo}>
          <Text style={styles.roomName}>{room.name}</Text>
          {room.description && (
            <Text style={styles.roomDescription}>{room.description}</Text>
          )}
          <Text style={styles.memberCount}>
            {room.currentMembers}/{room.maxMembers} 명
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.leaveButton}
            onPress={handleLeaveRoom}
          >
            <Text style={styles.leaveButtonText}>나가기</Text>
          </TouchableOpacity>
          
          {currentUserRole === 'owner' && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteRoom}
            >
              <Text style={styles.deleteButtonText}>방 삭제</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <MemberList
          members={room.members}
          currentUserId={currentUserId}
          roomId={room.id}
          isAdmin={isAdmin}
          onMemberUpdate={refetch}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  roomInfo: {
    marginBottom: 16,
  },
  roomName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  roomDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    lineHeight: 22,
  },
  memberCount: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  leaveButton: {
    backgroundColor: '#8E8E93',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  leaveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
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
