import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { RoomMember } from '@src/api/types';
import { colors, spacing, sizes, typography } from '@src/theme';

interface ItemRoomMemberProps {
  member: RoomMember;
  currentUserId: string;
  isAdmin: boolean;
  onRoleChange: (member: RoomMember) => void;
  onRemoveMember: (member: RoomMember) => void;
}

export const ItemRoomMember = ({
  member,
  currentUserId,
  isAdmin,
  onRoleChange,
  onRemoveMember,
}: ItemRoomMemberProps) => {
  const isCurrentUser = member.userId === currentUserId;
  const canManage = isAdmin && !isCurrentUser && member.role !== 'owner';

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'owner':
        return styles.roleOwner;
      case 'admin':
        return styles.roleAdmin;
      default:
        return styles.roleMember;
    }
  };

  return (
    <View style={styles.memberItem}>
      {/* 상단: 아바타 + 이름 + 역할 */}
      <View style={styles.memberInfo}>
        <View style={styles.avatarContainer}>
          {member.photoURL ? (
            <Image source={{ uri: member.photoURL }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {member.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={[
            styles.onlineIndicator,
            member.isOnline ? styles.online : styles.offline
          ]} />
        </View>

        <View style={styles.memberDetails}>
          <View style={styles.nameRow}>
            <Text style={styles.memberName} numberOfLines={1}>
              {member.displayName}
              {isCurrentUser && ' (나)'}
            </Text>
            <View style={[styles.roleTag, getRoleStyle(member.role)]}>
              <Text style={styles.roleTagText}>
                {member.role === 'owner' ? '방장' :
                  member.role === 'admin' ? '관리자' : '멤버'}
              </Text>
            </View>
          </View>
          <Text style={styles.joinDate}>
            {new Date(member.joinedAt).toLocaleDateString()} 참여
          </Text>
        </View>
      </View>

      {/* 하단: 관리 버튼 */}
      {canManage && (
        <View style={styles.memberActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onRoleChange(member)}
          >
            <Text style={styles.actionButtonText}>
              {member.role === 'admin' ? '멤버로 변경' : '관리자로 변경'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.removeButton]}
            onPress={() => onRemoveMember(member)}
          >
            <Text style={styles.removeButtonText}>추방</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  memberItem: {
    backgroundColor: colors.surfaceCard,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: sizes.radiusMd,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatarImage: {
    width: sizes.avatarMd,
    height: sizes.avatarMd,
    borderRadius: sizes.avatarMd / 2,
  },
  avatarPlaceholder: {
    width: sizes.avatarMd,
    height: sizes.avatarMd,
    borderRadius: sizes.avatarMd / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.h4,
    color: colors.textOnPrimary,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.surfaceCard,
  },
  online: {
    backgroundColor: colors.online,
  },
  offline: {
    backgroundColor: colors.offline,
  },
  memberDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  memberName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginRight: spacing.sm,
    flexShrink: 1,
  },
  roleTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: sizes.radiusSm,
  },
  roleTagText: {
    ...typography.caption,
    color: colors.textOnPrimary,
    fontSize: 10,
  },
  roleOwner: {
    backgroundColor: colors.roleOwner,
  },
  roleAdmin: {
    backgroundColor: colors.roleAdmin,
  },
  roleMember: {
    backgroundColor: colors.roleMember,
  },
  joinDate: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  memberActions: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: sizes.radiusSm,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  removeButton: {
    backgroundColor: 'transparent',
    borderColor: colors.error,
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  removeButtonText: {
    ...typography.caption,
    color: colors.error,
  },
});
