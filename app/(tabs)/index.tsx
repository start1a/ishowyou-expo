import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { RoomList, CreateRoomForm } from '@src/components/Room';
import { Room } from '@src/api/types';
import { colors, spacing, sizes, typography } from '@src/theme';

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
    backgroundColor: colors.backgroundDark,
  },
  header: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xxxxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.textOnPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.xl,
  },
  createButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: sizes.radiusFull,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  createButtonText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
  },
});
