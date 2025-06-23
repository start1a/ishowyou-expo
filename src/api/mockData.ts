// Mock 데이터 생성 유틸리티 (개발/테스트용)
import { Room, Member } from '@src/api/types';

// 임시 Mock 데이터 생성 함수들
export const generateMockMembers = (count: number = 5): Member[] => {
  const names = ['김철수', '이영희', '박민수', '정수진', '최영수', '한지민', '오준호', '임유나'];
  const avatars = ['👨', '👩', '🧑', '👱‍♂️', '👱‍♀️', '👨‍💼', '👩‍💼', '🧑‍💻'];
  
  return Array.from({ length: count }, (_, index) => ({
    id: `member-${index + 1}`,
    nickname: names[index % names.length],
    avatar: avatars[index % avatars.length],
    isOnline: Math.random() > 0.3, // 70% 확률로 온라인
    joinedAt: new Date(Date.now() - Math.random() * 86400000 * 7), // 최근 7일 내 랜덤
    role: index === 0 ? 'owner' : index === 1 ? 'admin' : 'member'
  }));
};

export const generateMockRooms = (count: number = 10): Room[] => {
  const roomNames = [
    '친구들과 함께 보는 방',
    '영화 감상실',
    '음악 듣기 모임',
    '스터디 그룹',
    '게임 방송 시청',
    '코딩 공부방',
    '운동 영상 보기',
    '요리 레시피 공유',
    '여행 영상 감상',
    'K-POP 뮤직비디오'
  ];

  const descriptions = [
    '함께 영상을 보며 채팅해요!',
    '재미있는 콘텐츠를 공유하는 공간입니다.',
    '편안한 분위기에서 함께 즐겨요.',
    '좋은 사람들과 함께하는 시간',
    '실시간으로 소통하며 영상을 시청해요.',
    undefined, // 설명 없는 방도 있음
    '모두 환영합니다!',
    '즐거운 시간 보내요~',
    undefined,
    '좋은 영상 추천 받아요!'
  ];

  return Array.from({ length: count }, (_, index) => {
    const members = generateMockMembers(Math.floor(Math.random() * 8) + 2); // 2-9명
    const maxMembers = Math.max(members.length, Math.floor(Math.random() * 10) + 5);
    
    return {
      id: `room-${index + 1}`,
      name: roomNames[index % roomNames.length],
      description: descriptions[index % descriptions.length],
      maxMembers,
      currentMembers: members.length,
      isPrivate: Math.random() > 0.7, // 30% 확률로 비공개
      password: Math.random() > 0.7 ? '1234' : undefined,
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 30), // 최근 30일 내
      updatedAt: new Date(Date.now() - Math.random() * 86400000 * 7), // 최근 7일 내
      createdBy: members[0]?.id || 'unknown',
      members
    };
  });
};

// 개발 모드에서 사용할 Mock API 응답 생성
export const createMockApiResponse = <T>(data: T, success: boolean = true) => {
  return {
    success,
    data: success ? data : undefined,
    error: success ? undefined : 'Mock API Error',
    message: success ? 'Success' : 'Error occurred'
  };
};
