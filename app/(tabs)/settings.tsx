import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@src/contexts/AuthContext';
import { colors, spacing, sizes, typography } from '@src/theme';
import { IconLogout } from '@src/assets/icons';
import { ConfirmDialog } from '@src/components/ConfirmDialog';
import { Toast } from '@src/components/Toast';

const SettingsScreen = () => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  // 로그아웃 확인 다이얼로그 상태
  const [isLogoutConfirmVisible, setIsLogoutConfirmVisible] = useState(false);

  // 토스트 알림 상태
  const [toastState, setToastState] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ visible: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
    setToastState({ visible: true, message, type });
  };

  const hideToast = () => {
    setToastState(prev => ({ ...prev, visible: false }));
  };

  const handleLogout = () => {
    setIsLogoutConfirmVisible(true);
  };

  const confirmLogout = async () => {
    setIsLogoutConfirmVisible(false);
    try {
      await logout();
    } catch (error) {
      showToast('로그아웃에 실패했습니다.', 'error');
    }
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

      {/* 로그아웃 확인 다이얼로그 */}
      <ConfirmDialog
        visible={isLogoutConfirmVisible}
        title="로그아웃"
        message="정말 로그아웃 하시겠습니까?"
        confirmText="로그아웃"
        cancelText="취소"
        confirmColor={colors.error}
        onConfirm={confirmLogout}
        onCancel={() => setIsLogoutConfirmVisible(false)}
      />

      {/* 토스트 알림 */}
      <Toast
        visible={toastState.visible}
        message={toastState.message}
        type={toastState.type}
        onHide={hideToast}
      />
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
