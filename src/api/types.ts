export interface Room {
  id: string;
  name: string;
  description?: string;
  maxMembers: number;
  currentMembers: number;
  isPrivate: boolean;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  members: Member[];
}

export interface Member {
  id: string;
  nickname: string;
  avatar?: string;
  isOnline: boolean;
  joinedAt: Date;
  role: 'owner' | 'admin' | 'member';
}

export interface CreateRoomRequest {
  name: string;
  description?: string;
  maxMembers: number;
  isPrivate: boolean;
  password?: string;
}

export interface JoinRoomRequest {
  roomId: string;
  password?: string;
  memberInfo: {
    nickname: string;
    avatar?: string;
  };
}

export interface UpdateMemberRequest {
  nickname?: string;
  avatar?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
