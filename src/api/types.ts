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

// User profile stored in /users/{userId}
export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  createdAt: number;
  lastLoginAt: number;
}
