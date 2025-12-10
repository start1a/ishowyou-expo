/**
 * 타이포그래피 토큰
 * 일관된 텍스트 스타일을 위한 스케일 시스템
 */

import { TextStyle, Platform } from 'react-native';

/**
 * 폰트 사이즈 스케일
 */
export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
} as const;

/**
 * 폰트 두께
 */
export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

/**
 * 줄 높이 배율
 */
export const lineHeights = {
  tight: 1.2, // 헤딩용
  normal: 1.5, // 본문용
  relaxed: 1.75, // 읽기 편한 텍스트
};

/**
 * 자간
 */
export const letterSpacings = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.5,
  wider: 1,
};

/**
 * 미리 정의된 텍스트 스타일
 */
export const typography = {
  // 헤딩
  h1: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['3xl'] * lineHeights.tight,
    letterSpacing: letterSpacings.tighter,
  } as TextStyle,

  h2: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes['2xl'] * lineHeights.tight,
    letterSpacing: letterSpacings.tight,
  } as TextStyle,

  h3: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xl * lineHeights.tight,
  } as TextStyle,

  h4: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.lg * lineHeights.normal,
  } as TextStyle,

  // 본문
  body: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.base * lineHeights.normal,
  } as TextStyle,

  bodyMedium: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.base * lineHeights.normal,
  } as TextStyle,

  bodySmall: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.md * lineHeights.normal,
  } as TextStyle,

  // 캡션 & 라벨
  caption: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.normal,
  } as TextStyle,

  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.sm * lineHeights.normal,
    textTransform: 'uppercase' as const,
    letterSpacing: letterSpacings.wide,
  } as TextStyle,

  overline: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.xs * lineHeights.normal,
    textTransform: 'uppercase' as const,
    letterSpacing: letterSpacings.wider,
  } as TextStyle,

  // 버튼
  button: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.base * lineHeights.tight,
  } as TextStyle,

  buttonSmall: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.md * lineHeights.tight,
  } as TextStyle,
} as const;

export type FontSizeKey = keyof typeof fontSizes;
export type TypographyKey = keyof typeof typography;
