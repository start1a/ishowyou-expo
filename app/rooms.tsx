import { Room } from '@/src/api';
import { CreateRoomForm, RoomList } from '@/src/components/Room';
import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function RoomScreen() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    Alert.alert(
      '방 참여',
      `${room.name} 방에 참여하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '참여', 
          onPress: () => {
            // TODO: 실제 방 참여 로직 구현
            Alert.alert('알림', '방 참여 기능을 구현해주세요.');
          }
        },
      ]
    );
  };

  const handleRoomCreated = (roomId: string) => {
    setShowCreateModal(false);
    Alert.alert('성공', '방이 생성되었습니다!', [
      {
        text: '확인',
        onPress: () => {
          // TODO: 생성된 방으로 이동하는 로직
          console.log('Created room ID:', roomId);
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>방 목록</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>+ 방 만들기</Text>
        </TouchableOpacity>
      </View>

      <RoomList onRoomSelect={handleRoomSelect} />

      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <CreateRoomForm
            onRoomCreated={handleRoomCreated}
            onCancel={() => setShowCreateModal(false)}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
});
