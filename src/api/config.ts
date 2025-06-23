// API 기본 설정
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
  USE_MOCK: true,
};

// API 엔드포인트 상수
export const ENDPOINTS = {
  ROOMS: '/rooms',
  MEMBERS: '/members',
  JOIN_ROOM: '/rooms/join',
  LEAVE_ROOM: '/rooms/leave',
} as const;
