import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, sizes, typography } from '@src/theme';
import { scaleWidth } from '@src/DeviceScale';

interface SyncToggleProps {
  isEnabled: boolean;
  isOwner: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const SyncToggle = ({
  isEnabled,
  isOwner,
  onToggle,
  disabled = false,
}: SyncToggleProps) => {
  // 방장: 파란색 (동기화 제어), 멤버: 초록색 (동기화 따라가기)
  const activeColor = isOwner ? colors.primary : colors.success;

  return (
    <TouchableOpacity
      style={[
        styles.wrapper,
        disabled && styles.disabled,
      ]}
      onPress={onToggle}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.container,
          isEnabled && { borderColor: activeColor },
        ]}
      >
        <View
          style={[
            styles.indicator,
            isEnabled && { backgroundColor: activeColor },
          ]}
        />
      </View>
      <Text style={[styles.label, isEnabled && { color: activeColor }]}>
        동기화
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleWidth(6),
  },
  container: {
    width: sizes.iconMd,
    height: sizes.iconMd,
    borderRadius: scaleWidth(14),
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  indicator: {
    width: scaleWidth(14),
    height: scaleWidth(14),
    borderRadius: scaleWidth(7),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
});
