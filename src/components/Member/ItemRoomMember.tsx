import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Member } from '@src/api/types';
import { colors, spacing, sizes, typography, shadows } from '@src/theme';

interface ItemRoomMemberProps {
  member: Member;
  currentUserId: string;
  isAdmin: boolean;
  onRoleChange: (member: Member) => void;
  onRemoveMember: (member: Member) => void;
}

export const ItemRoomMember = ({
  member,
  currentUserId,
  isAdmin,
  onRoleChange,
  onRemoveMember,
}: ItemRoomMemberProps) => {
  const isCurrentUser = member.id === currentUserId;
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
      <View style={styles.memberInfo}>
        <View style={styles.avatarContainer}>
          {member.avatar ? (
            <Text style={styles.avatar}>{member.avatar}</Text>
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {member.nickname.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={[
            styles.onlineIndicator,
            member.isOnline ? styles.online : styles.offline
          ]} />
        </View>

        <View style={styles.memberDetails}>
          <Text style={styles.memberName}>
            {member.nickname}
            {isCurrentUser && ' (나)'}
          </Text>
          <View style={styles.memberMeta}>
            <View style={[styles.roleTag, getRoleStyle(member.role)]}>
              <Text style={styles.roleTagText}>
                {member.role === 'owner' ? '방장' :
                  member.role === 'admin' ? '관리자' : '멤버'}
              </Text>
            </View>
            <Text style={styles.joinDate}>
              {new Date(member.joinedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      {canManage && (
        <View style={styles.memberActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.roleButton]}
            onPress={() => onRoleChange(member)}
          >
            <Text style={styles.actionButtonText}>
              {member.role === 'admin' ? '멤버로' : '관리자로'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.removeButton]}
            onPress={() => onRemoveMember(member)}
          >
            <Text style={styles.actionButtonText}>추방</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    borderRadius: sizes.radiusMd,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: sizes.avatarMd,
    height: sizes.avatarMd,
    borderRadius: sizes.avatarMd / 2,
    fontSize: 24,
    textAlign: 'center',
    lineHeight: sizes.avatarMd,
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
  memberName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: sizes.radiusSm,
    marginRight: spacing.sm,
  },
  roleTagText: {
    ...typography.caption,
    color: colors.textOnPrimary,
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
  },
  memberActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: sizes.radiusSm,
  },
  roleButton: {
    backgroundColor: colors.primary,
  },
  removeButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.textOnPrimary,
  },
});
