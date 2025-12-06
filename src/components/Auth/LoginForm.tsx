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
import { colors, spacing, sizes } from '@src/theme';

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
    shadowColor: colors.backgroundDark,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textOnDark,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
  },
  loginSection: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textOnDark,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
    lineHeight: 22,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: sizes.radiusMd,
    padding: spacing.lg,
    marginBottom: spacing.xxxl,
    width: '100%',
    shadowColor: colors.backgroundDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: colors.backgroundGray,
  },
  googleIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  googleButtonText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  infoContainer: {
    alignItems: 'flex-start',
    width: '100%',
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
});
