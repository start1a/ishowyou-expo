import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { colors, spacing, typography, sizes, shadows } from '@src/theme';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  confirmColor = colors.error,
  onConfirm,
  onCancel,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      // 등장 애니메이션
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 퇴장 애니메이션
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity,
              transform: [{ scale }],
            },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.dialog}>
              {/* 제목 */}
              <Text style={styles.title}>{title}</Text>

              {/* 메시지 */}
              {message && <Text style={styles.message}>{message}</Text>}

              {/* 버튼 영역 */}
              <View style={styles.buttonContainer}>
                {/* 취소 버튼 */}
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onCancel}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>

                {/* 확인 버튼 */}
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton, { backgroundColor: confirmColor }]}
                  onPress={onConfirm}
                  activeOpacity={0.7}
                >
                  <Text style={styles.confirmButtonText}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    maxWidth: 340,
  },
  dialog: {
    backgroundColor: colors.backgroundCard,
    borderRadius: sizes.radiusLg,
    padding: spacing.xl,
    ...shadows.xl,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: sizes.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.backgroundElevated,
  },
  cancelButtonText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  confirmButton: {
    // backgroundColor는 props에서 동적으로 설정
  },
  confirmButtonText: {
    ...typography.bodySmall,
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
});

export default ConfirmDialog;
