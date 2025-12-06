import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Member } from '@src/api/types';
import { colors, spacing, sizes } from '@src/theme';

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
            <Text style={styles.avatarPlaceholder}>
              {member.nickname.charAt(0).toUpperCase()}
            </Text>
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
            <Text style={[styles.roleTag, getRoleStyle(member.role)]}>
              {member.role === 'owner' ? '방장' :
                member.role === 'admin' ? '관리자' : '멤버'}
            </Text>
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
            <Text style={styles.roleButtonText}>
              {member.role === 'admin' ? '멤버로' : '관리자로'}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    borderRadius: sizes.radiusMd,
    elevation: 1,
    shadowColor: colors.backgroundDark,
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
    color: colors.textOnPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: sizes.avatarMd,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.backgroundLight,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleTag: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: sizes.radiusMd,
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  roleOwner: {
    backgroundColor: colors.warning,
    color: colors.textOnPrimary,
  },
  roleAdmin: {
    backgroundColor: colors.info,
    color: colors.textOnPrimary,
  },
  roleMember: {
    backgroundColor: colors.border,
    color: colors.textPrimary,
  },
  joinDate: {
    fontSize: 12,
    color: colors.offline,
  },
  memberActions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: sizes.radiusSm,
    borderRadius: sizes.radiusSm,
    marginLeft: spacing.sm,
  },
  roleButton: {
    backgroundColor: colors.primary,
  },
  removeButton: {
    backgroundColor: colors.error,
  },
  roleButtonText: {
    color: colors.textOnPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  removeButtonText: {
    color: colors.textOnPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
});
