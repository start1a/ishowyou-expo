/**
 * Theme - 전역 디자인 토큰
 *
 * IShowYou 디자인 시스템
 * - 다크 테마 기반 비디오 협업 플랫폼
 * - Electric Purple 액센트
 *
 * 사용법:
 * import { colors, spacing, sizes, typography, shadows } from '@src/theme';
 *
 * const styles = StyleSheet.create({
 *   container: {
 *     backgroundColor: colors.backgroundDark,
 *     padding: spacing.lg,
 *     borderRadius: sizes.radiusMd,
 *     ...shadows.md,
 *   },
 *   title: {
 *     ...typography.h2,
 *     color: colors.textPrimary,
 *   },
 * });
 */

export { colors, type ColorKey } from './colors';
export {
  spacing,
  sizes,
  shadows,
  type SpacingKey,
  type SizeKey,
  type ShadowKey,
} from './spacing';
export {
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
  typography,
  type FontSizeKey,
  type TypographyKey,
} from './typography';
