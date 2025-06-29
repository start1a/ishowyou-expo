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
      console.log('방 목록 불러오기 시작...');
      const response = await RoomService.getRooms();
      console.log('방 목록 응답:', response);
      
      if (response.success && response.data) {
        console.log('방 목록 불러오기 성공, 방 개수:', response.data.length);
        setRooms(response.data);
      } else {
        console.error('방 목록 불러오기 실패:', response.error);
        setError(response.error || '방 목록을 불러오는데 실패했습니다');
      }
    } catch (err) {
      console.error('네트워크 오류:', err);
      if (err instanceof Error) {
        setError(`네트워크 오류: ${err.message}`);
      } else {
        setError('알 수 없는 네트워크 오류가 발생했습니다');
      }
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
