import { StyleSheet, ScrollView } from 'react-native';
import { View, Text } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { Room, fetchRooms } from '@src/api/roomService';

export default function TabTwoScreen() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms()
      .then(setRooms)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {error && <Text style={styles.error}>{error}</Text>}
        {rooms.map((room) => (
          <View key={room.id} style={styles.roomItem}>
            <Text style={styles.roomName}>
              {room.name} ({room.members.length})
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
  },
  roomItem: {
    width: '100%',
    paddingVertical: 12,
    borderBottomColor: '#ccc',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  roomName: {
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});
