import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@src/contexts/AuthContext';
import { colors, spacing, sizes, typography } from '@src/theme';
import { IconLogout } from '@src/assets/icons';

const SettingsScreen = () => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('오류', '로그아웃에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.userSection}>
          <Text style={styles.sectionTitle}>계정</Text>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.displayName || '사용자'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuItemContent}>
              <IconLogout width={20} height={20} color={colors.error} />
              <Text style={styles.menuItemTextDanger}>로그아웃</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  userSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  userInfo: {
    backgroundColor: colors.backgroundCard,
    padding: spacing.lg,
    borderRadius: sizes.radiusMd,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  menuSection: {
    backgroundColor: colors.backgroundCard,
    borderRadius: sizes.radiusMd,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuItemTextDanger: {
    ...typography.body,
    color: colors.error,
  },
});
