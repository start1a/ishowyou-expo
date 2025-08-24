import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { RoomList, CreateRoomForm } from '@src/components/Room';
import { Room } from '@src/api/types';

const HomeScreen = () => {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleRoomSelect = (room: Room) => {
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
        <Text style={styles.title}>IShowYou</Text>
        <Text style={styles.subtitle}>함께 보는 즐거움</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>+ 방 만들기</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>참여 가능한 방</Text>
        <RoomList onRoomSelect={handleRoomSelect} />
      </View>

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
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
});
