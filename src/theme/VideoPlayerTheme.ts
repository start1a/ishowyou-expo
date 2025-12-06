import { colors, sizes } from './index';

/**
 * VideoPlayer 전용 테마
 * 전역 토큰을 기반으로 파생된 컴포넌트별 스타일
 */
export const VIDEO_PLAYER_THEME = {
  colors: {
    overlayBackground: colors.overlay50,
    text: colors.textOnDark,
    textSecondary: colors.textMuted,
    icon: colors.textOnDark,
  },
  sizes: {
    buttonRadius: sizes.radiusFull,
    timePillRadius: sizes.radiusLg + 4, // 24
  },
} as const;
