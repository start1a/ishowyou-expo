import { API_CONFIG } from '@src/api/config';
import { Room, CreateRoomRequest, ApiResponse, RoomVideo, PlaybackSettings } from '@src/api/types';
import { database } from '@src/config/firebase';
import { ref, get, push, set, remove, update, onValue } from 'firebase/database';

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

  // 방에 영상 추가
  static async addVideoToRoom(
    roomId: string,
    video: Omit<RoomVideo, 'addedAt'>
  ): Promise<ApiResponse<RoomVideo>> {
    if (API_CONFIG.USE_MOCK) {
      await this.mockDelay();
      const mockVideo: RoomVideo = { ...video, addedAt: Date.now() };
      return { success: true, data: mockVideo };
    }

    try {
      // 현재 방의 영상 목록 조회
      const roomRef = ref(database, `rooms/${roomId}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        return { success: false, error: '방을 찾을 수 없습니다' };
      }

      const roomData = snapshot.val();
      const currentVideos: RoomVideo[] = roomData.videos || [];

      // 이미 추가된 영상인지 확인
      const isDuplicate = currentVideos.some(v => v.videoId === video.videoId);
      if (isDuplicate) {
        return { success: false, error: '이미 추가된 영상입니다' };
      }

      // 새 영상 추가
      const newVideo: RoomVideo = {
        ...video,
        addedAt: Date.now()
      };

      const updatedVideos = [...currentVideos, newVideo];
      await update(roomRef, { videos: updatedVideos });

      return { success: true, data: newVideo };
    } catch (error) {
      console.error('Firebase 영상 추가 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '영상 추가에 실패했습니다'
      };
    }
  }

  // 방에서 영상 제거
  static async removeVideoFromRoom(
    roomId: string,
    videoId: string
  ): Promise<ApiResponse<void>> {
    if (API_CONFIG.USE_MOCK) {
      await this.mockDelay();
      return { success: true, data: undefined };
    }

    try {
      const roomRef = ref(database, `rooms/${roomId}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        return { success: false, error: '방을 찾을 수 없습니다' };
      }

      const roomData = snapshot.val();
      const currentVideos: RoomVideo[] = roomData.videos || [];

      const updatedVideos = currentVideos.filter(v => v.videoId !== videoId);
      await update(roomRef, { videos: updatedVideos });

      return { success: true, data: undefined };
    } catch (error) {
      console.error('Firebase 영상 제거 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '영상 제거에 실패했습니다'
      };
    }
  }

  // 방의 영상 목록 조회
  static async getVideosFromRoom(roomId: string): Promise<ApiResponse<RoomVideo[]>> {
    if (API_CONFIG.USE_MOCK) {
      await this.mockDelay();
      return { success: true, data: [] };
    }

    try {
      const roomRef = ref(database, `rooms/${roomId}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        return { success: false, error: '방을 찾을 수 없습니다' };
      }

      const roomData = snapshot.val();
      const videos: RoomVideo[] = roomData.videos || [];

      return { success: true, data: videos };
    } catch (error) {
      console.error('Firebase 영상 목록 조회 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '영상 목록을 불러오는데 실패했습니다'
      };
    }
  }

  // 재생 설정 업데이트
  static async updatePlaybackSettings(
    roomId: string,
    settings: PlaybackSettings
  ): Promise<ApiResponse<void>> {
    if (API_CONFIG.USE_MOCK) {
      await this.mockDelay();
      return { success: true, data: undefined };
    }

    try {
      const playbackRef = ref(database, `rooms/${roomId}/playbackSettings`);
      const cleanedSettings = this.cleanFirebaseData(settings);
      await set(playbackRef, cleanedSettings);

      return { success: true, data: undefined };
    } catch (error) {
      console.error('Firebase 재생 설정 업데이트 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '재생 설정 업데이트에 실패했습니다'
      };
    }
  }

  // 재생 설정 구독
  static subscribeToPlaybackSettings(
    roomId: string,
    callback: (settings: PlaybackSettings | null) => void
  ): () => void {
    const playbackRef = ref(database, `rooms/${roomId}/playbackSettings`);

    const unsubscribe = onValue(playbackRef, (snapshot) => {
      if (snapshot.exists()) {
        const settings = snapshot.val() as PlaybackSettings;
        callback(settings);
      } else {
        callback(null);
      }
    });

    return unsubscribe;
  }
}
