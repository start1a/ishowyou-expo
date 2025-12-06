/**
 * 전역 색상 토큰
 * 모든 컴포넌트에서 이 색상을 참조하여 일관성 유지
 */

export const colors = {
  // Primary
  primary: '#007AFF',
  primaryLight: '#4DA3FF',
  primaryDark: '#0055CC',

  // Background
  backgroundDark: '#000000',
  backgroundCard: '#1a1a1a',
  backgroundLight: '#FFFFFF',
  backgroundGray: '#F5F5F5',

  // Text
  textPrimary: '#333333',
  textSecondary: '#666666',
  textMuted: '#999999',
  textOnDark: '#FFFFFF',
  textOnPrimary: '#FFFFFF',

  // Semantic - Status
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  info: '#5856D6',

  // Overlay
  overlay50: 'rgba(0, 0, 0, 0.4)',
  overlay30: 'rgba(0, 0, 0, 0.3)',

  // Border
  border: '#E5E5EA',
  borderLight: '#F0F0F0',

  // Specific UI
  online: '#34C759',
  offline: '#8E8E93',
} as const;

export type ColorKey = keyof typeof colors;
