export type RepeatMode = 'once' | 'all' | 'repeat-one' | 'repeat-all';

export interface PlaybackSettings {
  repeatMode: RepeatMode;
  shuffle: boolean;
  setBy: string;
  updatedAt: number;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  isPrivate: boolean;
  password?: string;
  createdAt: number;
  members?: { [userId: string]: Omit<RoomMember, 'userId'> };
  videoState?: VideoState;
  videos?: RoomVideo[];
  playbackSettings?: PlaybackSettings;
}

// Room에 저장되는 영상 정보 (간소화된 형태)
export interface RoomVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  duration?: number;
  channelName?: string;
  addedBy: string;
  addedAt: number;
}

export interface RoomMember {
  userId: string;
  displayName: string;
  photoURL: string | null;
  role: 'owner' | 'admin' | 'member';
  isOnline: boolean;
  joinedAt: number;
  lastSeen: number;
}

export interface VideoState {
  videoId: string;
  isPlaying: boolean;
  currentTime: number;
  updatedAt: number;
  updatedBy: string;
}

// 동기화 상태 (rooms/{roomId}/sync)
export interface SyncState {
  isEnabled: boolean;        // 방장이 동기화 제어를 활성화했는지
  currentTime: number;       // 현재 동기화 시간
  isPlaying: boolean;        // 재생 상태
  videoId: string;           // 현재 재생 중인 비디오 ID
  updatedAt: number;         // 마지막 업데이트 시간
}

export interface CreateRoomRequest {
  name: string;
  description?: string;
  isPrivate: boolean;
  password?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 채팅 메시지 (messages/{roomId}/{date}/{messageId})
export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  displayName: string;
  photoURL: string | null;
  content: string;
  createdAt: number;
  type?: 'user' | 'system';
}

// User profile stored in /users/{userId}
export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  pushToken?: string;
  createdAt: number;
  lastLoginAt: number;
}
