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
} as const;

/**
 * 컴포넌트별 공통 사이즈
 */
export const sizes = {
  // Border Radius
  radiusSm: 6,
  radiusMd: 12,
  radiusLg: 20,
  radiusFull: 50,

  // Icon
  iconSm: 16,
  iconMd: 24,
  iconLg: 32,

  // Avatar
  avatarSm: 32,
  avatarMd: 48,
  avatarLg: 64,

  // Touch Target (최소 터치 영역)
  touchTarget: 44,
} as const;

export type SpacingKey = keyof typeof spacing;
export type SizeKey = keyof typeof sizes;
