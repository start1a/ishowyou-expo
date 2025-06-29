import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { RoomList, CreateRoomForm } from '@src/components/Room';
import { Room } from '@src/api/types';
import { router } from 'expo-router';

export default function RoomsTab() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleRoomSelect = (room: Room) => {
    // 방 상세 페이지로 이동
    router.push(`/room/${room.id}`);
  };

  const handleRoomCreated = (roomId: string) => {
    setShowCreateModal(false);
    Alert.alert('성공', '방이 생성되었습니다!', [
      {
        text: '확인',
        onPress: () => {
          // 생성된 방으로 이동
          router.push(`/room/${roomId}`);
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
    paddingTop: 50, // 상태바 공간 확보
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
