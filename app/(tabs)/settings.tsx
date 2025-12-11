import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import { useAuth } from '@src/contexts/AuthContext';
import { MiniHeader } from '@src/components/common';
import { ProfileSection, SettingsMenuSection } from '@src/components/Settings';
import { ConfirmDialog } from '@src/components/ConfirmDialog';
import { Toast } from '@src/components/Toast';
import { colors, spacing, typography, sizes } from '@src/theme';
import { IconLogout } from '@src/assets/icons';

const SettingsScreen = () => {
  const { user, logout } = useAuth();

  // 로그아웃 확인 다이얼로그 상태
  const [isLogoutConfirmVisible, setIsLogoutConfirmVisible] = useState(false);

  // 토스트 알림 상태
  const [toastState, setToastState] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ visible: false, message: '', type: 'success' });

  // 앱 버전
  const appVersion = Constants.expoConfig?.version || '1.0.0';

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

  const handleAboutPress = () => {
    showToast(`IShowYou v${appVersion}`, 'info');
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <MiniHeader />

      {/* 스크롤 콘텐츠 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 프로필 섹션 */}
        <ProfileSection user={user} />

        {/* 설정 메뉴 섹션 */}
        <SettingsMenuSection
          appVersion={appVersion}
          onAboutPress={handleAboutPress}
        />

        {/* 로그아웃 버튼 */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <IconLogout width={20} height={20} color={colors.error} />
            <Text style={styles.logoutButtonText}>로그아웃</Text>
          </TouchableOpacity>
        </View>

        {/* 버전 푸터 */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>버전 {appVersion}</Text>
        </View>
      </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  logoutSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 52,
    backgroundColor: colors.backgroundCard,
    borderRadius: sizes.radiusMd,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.error,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  versionText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
