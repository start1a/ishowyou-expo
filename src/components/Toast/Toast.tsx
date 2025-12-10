import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, sizes, shadows } from '@src/theme';
import { IconDone, IconX } from '@src/assets/icons';

export interface ToastProps {
  visible: boolean;
  message: string;
  subtitle?: string;
  thumbnail?: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onHide?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  subtitle,
  thumbnail,
  type = 'success',
  duration = 2500,
  onHide,
}) => {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;
  const gestureTranslateY = useRef(new Animated.Value(0)).current;

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
      gestureTranslateY.setValue(0);
      onHide?.();
    });
  };

  // 스와이프 제스처 핸들러
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 위로 스와이프할 때만 제스처 감지
        return gestureState.dy < -5;
      },
      onPanResponderMove: (_, gestureState) => {
        // 위로만 움직이도록 제한
        if (gestureState.dy < 0) {
          gestureTranslateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // 50px 이상 위로 스와이프하면 토스트 숨김
        if (gestureState.dy < -50) {
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(gestureTranslateY, {
              toValue: -100,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start(() => {
            gestureTranslateY.setValue(0);
            onHide?.();
          });
        } else {
          // 스와이프가 충분하지 않으면 원위치
          Animated.spring(gestureTranslateY, {
            toValue: 0,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

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
        return <IconX width={18} height={18} color={colors.textOnPrimary} />;
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
          transform: [
            { translateY },
            { translateY: gestureTranslateY }
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={hideToast}
        style={[styles.toast, { borderLeftColor: getTypeColor() }]}
      >
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
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </TouchableOpacity>
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
  subtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 14,
  },
});

export default Toast;
