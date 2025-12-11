import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@src/contexts/AuthContext';
import { colors, spacing, typography, sizes } from '@src/theme';
import { IconUser } from '@src/assets/icons';

interface MiniHeaderProps {
  onProfilePress?: () => void;
}

const MiniHeader = ({ onProfilePress }: MiniHeaderProps) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {/* 왼쪽: 로고 + 앱 이름 */}
        <View style={styles.logoSection}>
          <View style={styles.appIcon}>
            <Text style={styles.appIconText}>I</Text>
          </View>
          <Text style={styles.appName}>IShowYou</Text>
        </View>

        {/* 오른쪽: 프로필 아바타 */}
        <TouchableOpacity
          style={styles.profileButton}
          onPress={onProfilePress}
          activeOpacity={0.7}
        >
          {user?.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <IconUser width={20} height={20} color={colors.textSecondary} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MiniHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundDark,
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  appIcon: {
    width: 28,
    height: 28,
    borderRadius: sizes.radiusSm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIconText: {
    ...typography.button,
    color: colors.textOnPrimary,
    fontSize: 16,
  },
  appName: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  profileButton: {
    padding: spacing.xs,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: sizes.radiusFull,
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: sizes.radiusFull,
    backgroundColor: colors.backgroundCard,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
