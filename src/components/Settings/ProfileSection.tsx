import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { User } from 'firebase/auth';
import { colors, spacing, typography, sizes } from '@src/theme';
import { IconUser } from '@src/assets/icons';

interface ProfileSectionProps {
  user: User | null;
}

const ProfileSection = ({ user }: ProfileSectionProps) => {
  return (
    <View style={styles.container}>
      {/* 아바타 */}
      <View style={styles.avatarContainer}>
        {user?.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <IconUser width={40} height={40} color={colors.textSecondary} />
          </View>
        )}
      </View>

      {/* 사용자 이름 */}
      <Text style={styles.userName}>{user?.displayName || '사용자'}</Text>

      {/* 이메일 */}
      <Text style={styles.userEmail}>{user?.email}</Text>
    </View>
  );
};

export default ProfileSection;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: sizes.radiusFull,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: sizes.radiusFull,
    backgroundColor: colors.backgroundCard,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
