import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, sizes, shadows } from '@src/theme';
import { IconDone } from '@src/assets/icons';

export interface ToastProps {
  visible: boolean;
  message: string;
  thumbnail?: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onHide?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  thumbnail,
  type = 'success',
  duration = 2500,
  onHide,
}) => {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // 등장 애니메이션
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // 자동 숨김
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  if (!visible) return null;

  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'info':
        return colors.primary;
      default:
        return colors.success;
    }
  };

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <IconDone width={18} height={18} color={colors.textOnPrimary} />;
      case 'error':
        return <Text style={styles.icon}>✕</Text>;
      case 'info':
        return <Text style={styles.icon}>ℹ</Text>;
      default:
        return <IconDone width={18} height={18} color={colors.textOnPrimary} />;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + spacing.md,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={[styles.toast, { borderLeftColor: getTypeColor() }]}>
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.iconContainer, { backgroundColor: getTypeColor() }]}>
            {renderIcon()}
          </View>
        )}
        <View style={styles.content}>
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: sizes.radiusMd,
    borderLeftWidth: 4,
    padding: spacing.md,
    ...shadows.lg,
  },
  thumbnail: {
    width: 48,
    height: 36,
    borderRadius: sizes.radiusSm,
    marginRight: spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 16,
    color: colors.textOnPrimary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  message: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '500',
  },
});

export default Toast;
