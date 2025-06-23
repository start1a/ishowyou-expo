import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Member } from '@src/api/types';
import { useMember } from '@src/hooks/useMemberApi';

interface MemberListProps {
  members: Member[];
  currentUserId?: string;
  roomId: string;
  isAdmin?: boolean;
  onMemberUpdate?: () => void;
}

export const MemberList: React.FC<MemberListProps> = ({ 
  members, 
  currentUserId, 
  roomId, 
  isAdmin = false,
  onMemberUpdate 
}) => {
  const { updateMemberRole, removeMember, loading } = useMember();

  const handleRoleChange = async (member: Member) => {
    if (!isAdmin || member.id === currentUserId) return;

    const newRole = member.role === 'admin' ? 'member' : 'admin';
    const result = await updateMemberRole(roomId, member.id, newRole);
    
    if (result) {
      Alert.alert('성공', `${member.nickname}님의 권한이 변경되었습니다.`);
      onMemberUpdate?.();
    }
  };

  const handleRemoveMember = async (member: Member) => {
    if (!isAdmin || member.id === currentUserId || member.role === 'owner') return;

    Alert.alert(
      '멤버 추방',
      `${member.nickname}님을 방에서 추방하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '추방',
          style: 'destructive',
          onPress: async () => {
            const success = await removeMember(roomId, member.id);
            if (success) {
              Alert.alert('성공', `${member.nickname}님이 방에서 추방되었습니다.`);
              onMemberUpdate?.();
            }
          },
        },
      ]
    );
  };

  const renderMember = ({ item }: { item: Member }) => {
    const isCurrentUser = item.id === currentUserId;
    const canManage = isAdmin && !isCurrentUser && item.role !== 'owner';

    return (
      <View style={styles.memberItem}>
        <View style={styles.memberInfo}>
          <View style={styles.avatarContainer}>
            {item.avatar ? (
              <Text style={styles.avatar}>{item.avatar}</Text>
            ) : (
              <Text style={styles.avatarPlaceholder}>
                {item.nickname.charAt(0).toUpperCase()}
              </Text>
            )}
            <View style={[
              styles.onlineIndicator,
              item.isOnline ? styles.online : styles.offline
            ]} />
          </View>
          
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>
              {item.nickname}
              {isCurrentUser && ' (나)'}
            </Text>
            <View style={styles.memberMeta}>
              <Text style={[styles.roleTag, styles[`role${item.role}`]]}>
                {item.role === 'owner' ? '방장' : 
                 item.role === 'admin' ? '관리자' : '멤버'}
              </Text>
              <Text style={styles.joinDate}>
                {new Date(item.joinedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {canManage && (
          <View style={styles.memberActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.roleButton]}
              onPress={() => handleRoleChange(item)}
              disabled={loading}
            >
              <Text style={styles.roleButtonText}>
                {item.role === 'admin' ? '멤버로' : '관리자로'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.removeButton]}
              onPress={() => handleRemoveMember(item)}
              disabled={loading}
            >
              <Text style={styles.removeButtonText}>추방</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>멤버 ({members.length}명)</Text>
      <FlatList
        data={members}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  list: {
    flex: 1,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    fontSize: 24,
    textAlign: 'center',
    lineHeight: 48,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 48,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  online: {
    backgroundColor: '#34C759',
  },
  offline: {
    backgroundColor: '#8E8E93',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleTag: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  roleowner: {
    backgroundColor: '#FF9500',
    color: 'white',
  },
  roleadmin: {
    backgroundColor: '#5856D6',
    color: 'white',
  },
  rolemember: {
    backgroundColor: '#E5E5EA',
    color: '#333',
  },
  joinDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  memberActions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  roleButton: {
    backgroundColor: '#007AFF',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
  },
  roleButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
