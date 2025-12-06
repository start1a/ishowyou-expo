/**
 * 간격 토큰 (4px 기반 시스템)
 * 일관된 여백과 패딩을 위한 스케일
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
} as const;

/**
 * 컴포넌트별 공통 사이즈
 */
export const sizes = {
  // Border Radius
  radiusXs: 4,
  radiusSm: 6,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 20,
  radiusFull: 9999,

  // Icon
  iconXs: 12,
  iconSm: 16,
  iconMd: 24,
  iconLg: 32,
  iconXl: 48,

  // Avatar
  avatarXs: 24,
  avatarSm: 32,
  avatarMd: 48,
  avatarLg: 64,
  avatarXl: 80,

  // Touch Target (최소 터치 영역)
  touchTarget: 44,

  // Button Heights
  buttonSm: 32,
  buttonMd: 44,
  buttonLg: 52,

  // Input Heights
  inputSm: 36,
  inputMd: 44,
  inputLg: 52,
} as const;

/**
 * 그림자 스타일 프리셋
 */
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;

export type SpacingKey = keyof typeof spacing;
export type SizeKey = keyof typeof sizes;
export type ShadowKey = keyof typeof shadows;
