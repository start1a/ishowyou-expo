import { API_CONFIG } from '@src/api/config';
import { Room, CreateRoomRequest, ApiResponse } from '@src/api/types';
import { database } from '@src/config/firebase';
import { ref, get, push, set, remove } from 'firebase/database';

export class RoomService {
  // Mock 데이터 사용 시 지연 시뮬레이션
  private static async mockDelay(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Firebase에서 undefined 값들을 제거하는 헬퍼 함수
  private static cleanFirebaseData(data: any): any {
    const cleaned: any = {};
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        if (typeof data[key] === 'object' && !Array.isArray(data[key]) && !(data[key] instanceof Date)) {
          cleaned[key] = this.cleanFirebaseData(data[key]);
        } else {
          cleaned[key] = data[key];
        }
      }
    });
    return cleaned;
  }

  // 방 목록 조회
  static async getRooms(): Promise<ApiResponse<Room[]>> {
    if (API_CONFIG.USE_MOCK) {
      await this.mockDelay();
      return { success: true, data: [] };
    }

    try {
      const roomsRef = ref(database, 'rooms');
      const snapshot = await get(roomsRef);

      if (snapshot.exists()) {
        const roomsData = snapshot.val();
        const rooms: Room[] = Object.keys(roomsData).map(key => ({
          ...roomsData[key],
          id: key
        }));
        return { success: true, data: rooms };
      } else {
        return { success: true, data: [] };
      }
    } catch (error) {
      console.error('Firebase 방 목록 조회 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '방 목록을 불러오는데 실패했습니다'
      };
    }
  }

  // 특정 방 조회
  static async getRoom(roomId: string): Promise<ApiResponse<Room>> {
    if (API_CONFIG.USE_MOCK) {
      await this.mockDelay();
      return { success: false, error: 'Room not found' };
    }

    try {
      const roomRef = ref(database, `rooms/${roomId}`);
      const snapshot = await get(roomRef);

      if (snapshot.exists()) {
        const roomData = snapshot.val();
        const room: Room = {
          ...roomData,
          id: roomId
        };
        return { success: true, data: room };
      } else {
        return { success: false, error: '방을 찾을 수 없습니다' };
      }
    } catch (error) {
      console.error('Firebase 방 조회 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '방을 불러오는데 실패했습니다'
      };
    }
  }

  // 방 생성
  static async createRoom(
    roomData: CreateRoomRequest,
    creatorId: string,
    creatorInfo: { nickname: string; avatar?: string }
  ): Promise<ApiResponse<Room>> {
    if (API_CONFIG.USE_MOCK) {
      await this.mockDelay();
      const mockRoom: Room = {
        id: `room-${Date.now()}`,
        name: roomData.name,
        description: roomData.description,
        ownerId: creatorId,
        isPrivate: roomData.isPrivate,
        password: roomData.password,
        createdAt: Date.now(),
        members: {
          [creatorId]: {
            displayName: creatorInfo.nickname,
            photoURL: creatorInfo.avatar || null,
            role: 'owner',
            isOnline: true,
            joinedAt: Date.now(),
            lastSeen: Date.now()
          }
        }
      };
      return { success: true, data: mockRoom };
    }

    try {
      const roomsRef = ref(database, 'rooms');
      const newRoomRef = push(roomsRef);
      const now = Date.now();

      const newRoom: Omit<Room, 'id'> = {
        name: roomData.name,
        description: roomData.description,
        ownerId: creatorId,
        isPrivate: roomData.isPrivate,
        password: roomData.isPrivate ? roomData.password : undefined,
        createdAt: now,
        members: {
          [creatorId]: {
            displayName: creatorInfo.nickname,
            photoURL: creatorInfo.avatar || null,
            role: 'owner',
            isOnline: true,
            joinedAt: now,
            lastSeen: now
          }
        }
      };

      const cleanedRoom = this.cleanFirebaseData(newRoom);
      await set(newRoomRef, cleanedRoom);

      const createdRoom: Room = {
        ...newRoom,
        id: newRoomRef.key!
      };

      return { success: true, data: createdRoom };
    } catch (error) {
      console.error('Firebase 방 생성 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '방을 생성하는데 실패했습니다'
      };
    }
  }

  // 방 삭제
  static async deleteRoom(roomId: string): Promise<ApiResponse<void>> {
    if (API_CONFIG.USE_MOCK) {
      await this.mockDelay();
      return { success: true, data: undefined };
    }

    try {
      const roomRef = ref(database, `rooms/${roomId}`);
      await remove(roomRef);
      return { success: true, data: undefined };
    } catch (error) {
      console.error('Firebase 방 삭제 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '방 삭제에 실패했습니다'
      };
    }
  }
}
