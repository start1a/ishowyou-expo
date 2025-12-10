import { colors, sizes, spacing } from './index';

/**
 * VideoPlayer 전용 테마
 * 전역 토큰을 기반으로 파생된 컴포넌트별 스타일
 */
export const VIDEO_PLAYER_THEME = {
  colors: {
    overlayBackground: colors.overlay50,
    overlayBackgroundHeavy: colors.overlay70,
    text: colors.textOnDark,
    textSecondary: colors.textMuted,
    icon: colors.textOnDark,
    iconActive: colors.primary,
    progressTrack: 'rgba(255, 255, 255, 0.3)',
    progressFill: colors.primary,
    progressBuffer: 'rgba(255, 255, 255, 0.5)',
  },
  sizes: {
    buttonRadius: sizes.radiusFull,
    timePillRadius: sizes.radiusXl,
    controlIconSize: sizes.iconLg,
    smallIconSize: sizes.iconMd,
    progressBarHeight: 4,
    progressBarHeightActive: 6,
  },
  spacing: {
    controlsPadding: spacing.lg,
    buttonGap: spacing.xxl,
    timePillPadding: spacing.sm,
  },
} as const;
