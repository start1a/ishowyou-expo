import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '@src/contexts/AuthContext';
import { colors, spacing, sizes, typography, shadows } from '@src/theme';

export const LoginForm = () => {
  const { googleLogin, loading } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
    } catch (error: any) {
      console.error('Google login error:', error);
      let errorMessage = '로그인에 실패했습니다.';

      if (error.code) {
        switch (error.code) {
          case 'auth/user-disabled':
            errorMessage = '계정이 비활성화되었습니다.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Google 로그인이 허용되지 않습니다.';
            break;
          case 'auth/cancelled-popup-request':
          case 'auth/popup-closed-by-user':
            errorMessage = '로그인이 취소되었습니다.';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }

      Alert.alert('로그인 오류', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>📺</Text>
          <Text style={styles.title}>IShowYou</Text>
          <Text style={styles.subtitle}>함께 보는 즐거움</Text>
        </View>

        <View style={styles.loginSection}>
          <Text style={styles.welcomeText}>환영합니다!</Text>
          <Text style={styles.descriptionText}>
            Google 계정으로 간편하게 로그인하세요
          </Text>

          <TouchableOpacity
            style={[styles.googleButton, loading && styles.disabledButton]}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Text style={styles.googleIcon}>🌐</Text>
                <Text style={styles.googleButtonText}>Google로 로그인</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              • 개인정보는 안전하게 보호됩니다
            </Text>
            <Text style={styles.infoText}>
              • Google 계정으로 빠른 로그인
            </Text>
            <Text style={styles.infoText}>
              • 언제든지 로그아웃 가능
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  formContainer: {
    backgroundColor: colors.backgroundCard,
    borderRadius: sizes.radiusLg,
    padding: spacing.xxxl,
    ...shadows.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxxl,
  },
  logoText: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
  },
  loginSection: {
    alignItems: 'center',
  },
  welcomeText: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  descriptionText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
    lineHeight: 22,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: sizes.radiusMd,
    padding: spacing.lg,
    marginBottom: spacing.xxxl,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
  googleIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  googleButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  infoContainer: {
    alignItems: 'flex-start',
    width: '100%',
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
});
