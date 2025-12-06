import { CreateRoomRequest, RoomService } from '@src/api';
import { useAuth } from '@src/contexts/AuthContext';
import { colors, spacing, sizes, typography } from '@src/theme';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';

interface Props {
  onRoomCreated?: (roomId: string) => void;
  onCancel?: () => void;
}

export const CreateRoomForm = ({ onRoomCreated, onCancel }: Props) => {

  const { user } = useAuth();
  const [formData, setFormData] = useState<CreateRoomRequest>({
    name: '',
    description: '',
    isPrivate: false,
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }

    if (!formData.name.trim()) {
      Alert.alert('오류', '방 이름을 입력해주세요.');
      return;
    }

    if (formData.isPrivate && !formData.password?.trim()) {
      Alert.alert('오류', '비공개 방은 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await RoomService.createRoom(
        {
          ...formData,
          password: formData.isPrivate ? formData.password : undefined,
        },
        user.uid,
        {
          nickname: user.displayName || '익명',
          avatar: user.photoURL || undefined,
        }
      );

      if (response.success && response.data) {
        Alert.alert('성공', '방이 생성되었습니다!');
        onRoomCreated?.(response.data.id);
      } else {
        Alert.alert('오류', response.error || '방 생성에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>새 방 만들기</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>방 이름 *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          placeholder="방 이름을 입력하세요"
          placeholderTextColor={colors.textMuted}
          maxLength={50}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>방 설명</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          placeholder="방에 대한 설명을 입력하세요"
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={3}
          maxLength={200}
        />
      </View>

      <View style={styles.checkboxGroup}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setFormData(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
        >
          <View style={[styles.checkboxBox, formData.isPrivate && styles.checkboxChecked]}>
            {formData.isPrivate && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>비공개 방</Text>
        </TouchableOpacity>
      </View>

      {formData.isPrivate && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>비밀번호 *</Text>
          <TextInput
            style={styles.input}
            value={formData.password}
            onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
            placeholder="비밀번호를 입력하세요"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            maxLength={20}
          />
        </View>
      )}

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>취소</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.createButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? '생성 중...' : '방 만들기'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    backgroundColor: colors.backgroundCard,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: sizes.radiusMd,
    padding: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundElevated,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  checkboxGroup: {
    marginBottom: spacing.lg,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: sizes.radiusXs,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.textOnPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  button: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: sizes.radiusMd,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  createButton: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  createButtonText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
});
