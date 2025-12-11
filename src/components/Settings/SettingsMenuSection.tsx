import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, sizes } from '@src/theme';

interface MenuItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  isLast?: boolean;
}

const MenuItem = ({ icon, label, value, onPress, isLast }: MenuItemProps) => (
  <TouchableOpacity
    style={[styles.menuItem, !isLast && styles.menuItemBorder]}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    disabled={!onPress}
  >
    <View style={styles.menuItemLeft}>
      <Text style={styles.menuItemIcon}>{icon}</Text>
      <Text style={styles.menuItemLabel}>{label}</Text>
    </View>
    <View style={styles.menuItemRight}>
      {value && <Text style={styles.menuItemValue}>{value}</Text>}
      {onPress && <Text style={styles.menuItemChevron}>›</Text>}
    </View>
  </TouchableOpacity>
);

interface SettingsMenuSectionProps {
  appVersion: string;
  onAboutPress?: () => void;
}

const SettingsMenuSection = ({ appVersion, onAboutPress }: SettingsMenuSectionProps) => {
  return (
    <View style={styles.container}>
      {/* 섹션 타이틀 */}
      <Text style={styles.sectionTitle}>설정</Text>

      {/* 메뉴 그룹 */}
      <View style={styles.menuGroup}>
        <MenuItem
          icon="🎨"
          label="테마"
          value="다크"
        />
        <MenuItem
          icon="ℹ️"
          label="앱 정보"
          value={`v${appVersion}`}
          onPress={onAboutPress}
          isLast
        />
      </View>
    </View>
  );
};

export default SettingsMenuSection;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  menuGroup: {
    backgroundColor: colors.backgroundCard,
    borderRadius: sizes.radiusLg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: spacing.lg,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuItemIcon: {
    fontSize: 18,
  },
  menuItemLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuItemValue: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  menuItemChevron: {
    fontSize: 20,
    color: colors.textMuted,
    fontWeight: '300',
  },
});
