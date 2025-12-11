import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useAuth } from '@src/contexts/AuthContext';
import { colors, spacing, sizes, typography } from '@src/theme';
import { IconPlay, IconChat, IconUser, IconWarning } from '@src/assets/icons';

// Feature 데이터
const FEATURES = [
  {
    icon: IconPlay,
    title: '실시간 동기화',
    description: '친구들과 같은 장면을 동시에 시청',
  },
  {
    icon: IconChat,
    title: '실시간 채팅',
    description: '영상을 보면서 대화를 나눠요',
  },
  {
    icon: IconUser,
    title: '간편한 방 관리',
    description: '누구나 쉽게 방을 만들고 참여',
  },
];

// FeatureItem 컴포넌트
const FeatureItem = ({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  delay: number;
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 500 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.featureItem, animatedStyle]}>
      <View style={styles.featureIconContainer}>
        <Icon width={22} height={22} color={colors.primary} />
      </View>
      <View style={styles.featureTextContainer}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </Animated.View>
  );
};

export const LoginForm = () => {
  const { googleLogin, loading } = useAuth();
  const { height } = useWindowDimensions();
  const isSmallDevice = height < 700;

  // 에러 상태
  const [error, setError] = useState<string | null>(null);

  // 애니메이션 값
  const logoOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(-30);
  const logoFloat = useSharedValue(0);
  const bottomOpacity = useSharedValue(0);
  const bottomTranslateY = useSharedValue(30);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // 로고 애니메이션
    logoOpacity.value = withTiming(1, { duration: 600 });
    logoTranslateY.value = withTiming(0, { duration: 600 });

    // 로고 플로팅 애니메이션
    logoFloat.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // 하단 섹션 애니메이션
    bottomOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    bottomTranslateY.value = withDelay(600, withTiming(0, { duration: 500 }));
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { translateY: logoTranslateY.value + logoFloat.value },
    ],
  }));

  const bottomAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bottomOpacity.value,
    transform: [{ translateY: bottomTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withTiming(0.98, { duration: 100 });
  };

  const handlePressOut = () => {
    buttonScale.value = withTiming(1, { duration: 100 });
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await googleLogin();
    } catch (err: any) {
      console.error('Google login error:', err);
      let errorMessage = '로그인에 실패했습니다. 다시 시도해주세요.';

      if (err.code) {
        switch (err.code) {
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
            errorMessage = err.message || errorMessage;
        }
      }

      setError(errorMessage);

      // 5초 후 에러 자동 숨김
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleTermsPress = () => {
    // TODO: 실제 이용약관 URL로 교체
    Linking.openURL('https://example.com/terms');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Section */}
      <View style={[styles.topSection, isSmallDevice && styles.topSectionSmall]}>
        {/* Logo Section */}
        <Animated.View style={[styles.logoSection, logoAnimatedStyle, isSmallDevice && styles.logoSectionSmall]}>
          <View style={[styles.appIcon, isSmallDevice && styles.appIconSmall]}>
            <IconPlay width={48} height={48} color={colors.textOnPrimary} />
          </View>
          <Text style={styles.appName}>IShowYou</Text>
          <Text style={styles.tagline}>함께 보는 즐거움</Text>
        </Animated.View>

        {/* Feature Highlights */}
        <View style={[styles.featureHighlights, isSmallDevice && styles.featureHighlightsSmall]}>
          {FEATURES.map((feature, index) => (
            <FeatureItem
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={300 + index * 100}
            />
          ))}
        </View>
      </View>

      {/* Bottom Section */}
      <Animated.View style={[styles.bottomSection, bottomAnimatedStyle]}>
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <IconWarning width={16} height={16} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Google Login Button */}
        <Animated.View style={buttonAnimatedStyle}>
          <TouchableOpacity
            style={[styles.googleButton, loading && styles.googleButtonDisabled]}
            onPress={handleGoogleLogin}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={loading}
            activeOpacity={0.9}
            accessibilityLabel="Google 계정으로 로그인"
            accessibilityRole="button"
          >
            {loading ? (
              <>
                <ActivityIndicator size={24} color="#1F1F1F" />
                <Text style={styles.googleButtonText}>로그인 중...</Text>
              </>
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleButtonText}>Google로 계속하기</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Legal Links */}
        <View style={styles.legalLinks}>
          <Text style={styles.legalText}>계속하면 </Text>
          <TouchableOpacity onPress={handleTermsPress} accessibilityRole="link">
            <Text style={styles.legalLink}>이용약관</Text>
          </TouchableOpacity>
          <Text style={styles.legalText}>에 동의합니다</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  topSectionSmall: {
    paddingHorizontal: spacing.lg,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoSectionSmall: {
    marginBottom: spacing.lg,
  },
  appIcon: {
    width: 100,
    height: 100,
    borderRadius: sizes.radiusXl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  appIconSmall: {
    width: 80,
    height: 80,
  },
  appName: {
    ...typography.h1,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginTop: spacing.lg,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  featureHighlights: {
    marginTop: spacing.xxxl,
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
  },
  featureHighlightsSmall: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: sizes.radiusMd,
    backgroundColor: colors.backgroundCard,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  featureTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  featureDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  bottomSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: sizes.radiusSm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    ...typography.bodySmall,
    color: '#EF4444',
    flex: 1,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    width: '100%',
    height: 56,
    borderRadius: sizes.radiusMd,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  googleButtonDisabled: {
    opacity: 0.8,
  },
  googleIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  googleButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  legalLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  legalText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  legalLink: {
    ...typography.caption,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
