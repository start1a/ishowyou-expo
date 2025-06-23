import { apiClient } from '@src/api/client';
import { ENDPOINTS, API_CONFIG } from '@src/api/config';
import { Room, CreateRoomRequest, JoinRoomRequest, ApiResponse } from '@src/api/types';
import { generateMockRooms, createMockApiResponse } from '@src/api/mockData';

export class RoomService {
  // Mock 데이터 사용 시 지연 시뮬레이션
  private static async mockDelay(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 방 목록 조회
  static async getRooms(): Promise<ApiResponse<Room[]>> {
    // Mock API 사용
    if (API_CONFIG.USE_MOCK) {
      await this.mockDelay();
      const mockRooms = generateMockRooms(8);
      return createMockApiResponse(mockRooms);
    }
    
    return apiClient.get<Room[]>(ENDPOINTS.ROOMS);
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
    
    return apiClient.get<Room>(`${ENDPOINTS.ROOMS}/${roomId}`);
  }

  // 방 생성
  static async createRoom(roomData: CreateRoomRequest): Promise<ApiResponse<Room>> {
    if (API_CONFIG.USE_MOCK) {
      await this.mockDelay();
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        ...roomData,
        currentMembers: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user-id',
        members: [{
          id: 'current-user-id',
          nickname: '방장',
          isOnline: true,
          joinedAt: new Date(),
          role: 'owner'
        }]
      };
      return createMockApiResponse(newRoom);
    }
    
    return apiClient.post<Room>(ENDPOINTS.ROOMS, roomData);
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
    
    return apiClient.post<Room>(ENDPOINTS.JOIN_ROOM, joinData);
  }

  // 방 나가기
  static async leaveRoom(roomId: string, memberId: string): Promise<ApiResponse<void>> {
    if (API_CONFIG.USE_MOCK) {
      await this.mockDelay();
      return createMockApiResponse(undefined);
    }
    
    return apiClient.post<void>(ENDPOINTS.LEAVE_ROOM, { roomId, memberId });
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
