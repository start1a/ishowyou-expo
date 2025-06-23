import { useState, useEffect } from 'react';
import { RoomService } from '@src/api';
import { Room, ApiResponse } from '@src/api/types';

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await RoomService.getRooms();
      if (response.success && response.data) {
        setRooms(response.data);
      } else {
        setError(response.error || 'Failed to fetch rooms');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return {
    rooms,
    loading,
    error,
    refetch: fetchRooms,
  };
};

export const useRoom = (roomId: string) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoom = async () => {
    if (!roomId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await RoomService.getRoom(roomId);
      if (response.success && response.data) {
        setRoom(response.data);
      } else {
        setError(response.error || 'Failed to fetch room');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, [roomId]);

  return {
    room,
    loading,
    error,
    refetch: fetchRoom,
  };
};
