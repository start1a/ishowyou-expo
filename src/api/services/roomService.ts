import { apiClient } from '@src/api/client';
import { ENDPOINTS, API_CONFIG } from '@src/api/config';
import { Room, CreateRoomRequest, JoinRoomRequest, ApiResponse } from '@src/api/types';
import { generateMockRooms, createMockApiResponse } from '@src/api/mockData';
import { database } from '@src/config/firebase';
import { ref, get, push, set, update, remove } from 'firebase/database';

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
    // Mock API 사용
    if (API_CONFIG.USE_MOCK) {
      await this.mockDelay();
      const mockRooms = generateMockRooms(8);
      return createMockApiResponse(mockRooms);
    }
    
    // Firebase Realtime Database 사용
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
      const mockRooms = generateMockRooms(10);
      const room = mockRooms.find(r => r.id === roomId);
      if (room) {
        return createMockApiResponse(room);
      } else {
        return { success: false, error: 'Room not found' };
      }
    }
    
    // Firebase Realtime Database 사용
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
  static async createRoom(roomData: CreateRoomRequest, creatorId: string, creatorInfo: { nickname: string; avatar?: string }): Promise<ApiResponse<Room>> {
    if (API_CONFIG.USE_MOCK) {
      await this.mockDelay();
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        ...roomData,
        currentMembers: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: creatorId,
        members: [{
          id: creatorId,
          nickname: creatorInfo.nickname,
          avatar: creatorInfo.avatar,
          isOnline: true,
          joinedAt: new Date(),
          role: 'owner'
        }]
      };
      return createMockApiResponse(newRoom);
    }
    
    // Firebase Realtime Database 사용
    try {
      const roomsRef = ref(database, 'rooms');
      const newRoomRef = push(roomsRef);
      
      const newRoom = {
        ...roomData,
        currentMembers: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: creatorId,
        members: [{
          id: creatorId,
          nickname: creatorInfo.nickname,
          avatar: creatorInfo.avatar,
          isOnline: true,
          joinedAt: new Date(),
          role: 'owner' as const
        }]
      };
      
      // undefined 값들을 제거하고 Firebase에 저장
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

  // 방 참여
  static async joinRoom(joinData: JoinRoomRequest): Promise<ApiResponse<Room>> {
    if (API_CONFIG.USE_MOCK) {
      await this.mockDelay();
      // Mock: 방 참여 성공으로 가정
      const mockRooms = generateMockRooms(10);
      const room = mockRooms.find(r => r.id === joinData.roomId);
      if (room) {
        return createMockApiResponse(room);
      }
      return { success: false, error: 'Room not found' };
    }
    
    // Firebase Realtime Database 사용
    try {
      const roomRef = ref(database, `rooms/${joinData.roomId}`);
      const snapshot = await get(roomRef);
      
      if (!snapshot.exists()) {
        return { success: false, error: '방을 찾을 수 없습니다' };
      }
      
      const roomData = snapshot.val();
      
      // 이미 참여한 멤버인지 확인
      const isAlreadyMember = roomData.members?.some((member: any) => member.id === joinData.memberId);
      if (isAlreadyMember) {
        return { success: false, error: '이미 참여한 사용자입니다' };
      }
      
      // 방이 가득 찬지 확인
      if (roomData.currentMembers >= roomData.maxMembers) {
        return { success: false, error: '방이 가득 찼습니다' };
      }
      
      // 새 멤버 추가
      const newMember = {
        id: joinData.memberId,
        nickname: joinData.memberInfo.nickname,
        avatar: joinData.memberInfo.avatar,
        isOnline: true,
        joinedAt: new Date(),
        role: 'member' as const
      };
      
      const updatedMembers = [...(roomData.members || []), newMember];
      const updates = {
        members: updatedMembers,
        currentMembers: updatedMembers.length,
        updatedAt: new Date()
      };
      
      await update(roomRef, updates);
      
      const updatedRoom: Room = {
        ...roomData,
        ...updates,
        id: joinData.roomId
      };
      
      return { success: true, data: updatedRoom };
    } catch (error) {
      console.error('Firebase 방 참여 오류:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '방 참여에 실패했습니다' 
      };
    }
  }

  // 방 나가기
  static async leaveRoom(roomId: string, memberId: string): Promise<ApiResponse<void>> {
    if (API_CONFIG.USE_MOCK) {
      await this.mockDelay();
      return createMockApiResponse(undefined);
    }
    
    // Firebase Realtime Database 사용
    try {
      const roomRef = ref(database, `rooms/${roomId}`);
      const snapshot = await get(roomRef);
      
      if (!snapshot.exists()) {
        return { success: false, error: '방을 찾을 수 없습니다' };
      }
      
      const roomData = snapshot.val();
      const updatedMembers = (roomData.members || []).filter((member: any) => member.id !== memberId);
      
      const updates = {
        members: updatedMembers,
        currentMembers: updatedMembers.length,
        updatedAt: new Date()
      };
      
      await update(roomRef, updates);
      
      // 세션에서도 제거
      const sessionMemberRef = ref(database, `sessions/${roomId}/members/${memberId}`);
      await remove(sessionMemberRef);
      
      return { success: true, data: undefined };
    } catch (error) {
      console.error('Firebase 방 나가기 오류:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '방 나가기에 실패했습니다' 
      };
    }
  }

  // 방 정보 수정
  static async updateRoom(roomId: string, updates: Partial<CreateRoomRequest>): Promise<ApiResponse<Room>> {
    if (API_CONFIG.USE_MOCK) {
      await this.mockDelay();
      const mockRooms = generateMockRooms(10);
      const room = mockRooms.find(r => r.id === roomId);
      if (room) {
        const updatedRoom = { ...room, ...updates, updatedAt: new Date() };
        return createMockApiResponse(updatedRoom);
      }
      return { success: false, error: 'Room not found' };
    }
    
    return apiClient.put<Room>(`${ENDPOINTS.ROOMS}/${roomId}`, updates);
  }

  // 방 삭제
  static async deleteRoom(roomId: string): Promise<ApiResponse<void>> {
    if (API_CONFIG.USE_MOCK) {
      await this.mockDelay();
      return createMockApiResponse(undefined);
    }
    
    return apiClient.delete<void>(`${ENDPOINTS.ROOMS}/${roomId}`);
  }

  // 방의 멤버 목록 조회
  static async getRoomMembers(roomId: string): Promise<ApiResponse<Room['members']>> {
    if (API_CONFIG.USE_MOCK) {
      await this.mockDelay();
      const mockRooms = generateMockRooms(10);
      const room = mockRooms.find(r => r.id === roomId);
      if (room) {
        return createMockApiResponse(room.members);
      }
      return { success: false, error: 'Room not found' };
    }
    
    return apiClient.get<Room['members']>(`${ENDPOINTS.ROOMS}/${roomId}/members`);
  }
}
