import { CreateRoomRequest, RoomService } from '@src/api';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';

interface CreateRoomFormProps {
  onRoomCreated?: (roomId: string) => void;
  onCancel?: () => void;
}

export const CreateRoomForm: React.FC<CreateRoomFormProps> = ({ onRoomCreated, onCancel }) => {
  const [formData, setFormData] = useState<CreateRoomRequest>({
    name: '',
    description: '',
    maxMembers: 10,
    isPrivate: false,
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
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
      const response = await RoomService.createRoom({
        ...formData,
        password: formData.isPrivate ? formData.password : undefined,
      });

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
          multiline
          numberOfLines={3}
          maxLength={200}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>최대 인원</Text>
        <TextInput
          style={styles.input}
          value={formData.maxMembers.toString()}
          onChangeText={(text) => {
            const num = parseInt(text) || 1;
            setFormData(prev => ({ ...prev, maxMembers: Math.min(Math.max(num, 1), 100) }));
          }}
          placeholder="최대 인원"
          keyboardType="numeric"
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
          style={[styles.button, styles.createButton]}
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
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  checkboxGroup: {
    marginBottom: 16,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  createButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
