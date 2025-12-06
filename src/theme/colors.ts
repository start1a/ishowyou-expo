/**
 * 전역 색상 토큰
 * IShowYou - 비디오 협업 플랫폼을 위한 다크 테마 기반 컬러 시스템
 *
 * 디자인 원칙:
 * - 다크 테마 기반으로 비디오 시청 시 눈의 피로 감소
 * - Electric Purple 액센트로 프리미엄하고 트렌디한 느낌
 * - 따뜻한 골드 역할 배지로 소셜 커뮤니티 강조
 */

export const colors = {
  // Primary - Electric Purple (메인 액션, CTA)
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  primaryDark: '#7C3AED',

  // Background - 다크 테마 기반
  backgroundDark: '#0F0F0F', // 거의 검정, 메인 배경
  backgroundCard: '#1A1A1A', // 카드 배경
  backgroundElevated: '#262626', // 입력필드, 모달
  backgroundLight: '#2D2D2D', // 강조된 표면

  // Surface - 컨테이너용
  surfaceCard: '#1E1E1E',
  surfaceElevated: '#2D2D2D',
  surfaceModal: '#252525',

  // Text - 다크 테마용
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textOnDark: '#FFFFFF',
  textOnPrimary: '#FFFFFF',

  // Semantic - Status
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Overlay
  overlay50: 'rgba(0, 0, 0, 0.5)',
  overlay30: 'rgba(0, 0, 0, 0.3)',
  overlay70: 'rgba(0, 0, 0, 0.7)',

  // Border - 다크 테마용
  border: '#3F3F46',
  borderLight: '#27272A',
  borderFocus: '#8B5CF6',

  // Specific UI
  online: '#22C55E',
  offline: '#6B7280',

  // Role Colors - 소셜 역할 배지
  roleOwner: '#F59E0B', // Gold - 방장
  roleAdmin: '#8B5CF6', // Purple - 관리자
  roleMember: '#6B7280', // Gray - 일반 멤버

  // Gradient (버튼, 배경용)
  gradientStart: '#8B5CF6',
  gradientEnd: '#6366F1',

  // Interactive States
  pressed: 'rgba(139, 92, 246, 0.2)',
  hover: 'rgba(139, 92, 246, 0.1)',
  disabled: '#3F3F46',
  disabledText: '#52525B',
} as const;

export type ColorKey = keyof typeof colors;
