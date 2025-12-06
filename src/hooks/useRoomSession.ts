import { useState, useEffect, useRef } from 'react';
import { database } from '@src/config/firebase';
import { ref, onValue, off, set, remove, onDisconnect } from 'firebase/database';
import { RoomMember } from '@src/api/types';

interface UseRoomSessionReturn {
  members: RoomMember[];
  isConnected: boolean;
  joinRoom: (memberInfo: { displayName: string; photoURL?: string; role: 'owner' | 'admin' | 'member' }) => Promise<void>;
  leaveRoom: () => Promise<void>;
}

export const useRoomSession = (roomId: string, currentUserId?: string): UseRoomSessionReturn => {
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const membersRef = useRef<any>(null);
  const memberRef = useRef<any>(null);
  const disconnectRef = useRef<any>(null);

  // 멤버 데이터 실시간 리스너 설정
  useEffect(() => {
    if (!roomId) return;

    const membersPath = `rooms/${roomId}/members`;
    membersRef.current = ref(database, membersPath);

    const unsubscribe = onValue(membersRef.current, (snapshot) => {
      if (snapshot.exists()) {
        const membersData = snapshot.val();
        const membersList = Object.entries(membersData).map(([odI, member]) => ({
          ...(member as Omit<RoomMember, 'userId'>),
          userId: odI
        }));
        setMembers(membersList);
      } else {
        setMembers([]);
      }
    });

    return () => {
      if (membersRef.current) {
        off(membersRef.current, 'value', unsubscribe);
      }
    };
  }, [roomId]);

  // 방 참여
  const joinRoom = async (memberInfo: { displayName: string; photoURL?: string; role: 'owner' | 'admin' | 'member' }) => {
    if (!roomId || !currentUserId) return;

    try {
      const now = Date.now();
      const memberPath = `rooms/${roomId}/members/${currentUserId}`;
      memberRef.current = ref(database, memberPath);

      const memberData: Omit<RoomMember, 'userId'> = {
        displayName: memberInfo.displayName,
        photoURL: memberInfo.photoURL || null,
        role: memberInfo.role,
        isOnline: true,
        joinedAt: now,
        lastSeen: now
      };

      // 멤버 정보 설정
      await set(memberRef.current, memberData);

      // 연결 해제 시 멤버 완전 삭제 (앱 종료/네트워크 끊김)
      disconnectRef.current = onDisconnect(memberRef.current);
      await disconnectRef.current.remove();

      setIsConnected(true);
    } catch (error) {
      console.error('방 참여 실패:', error);
      throw error;
    }
  };

  // 방 퇴장
  const leaveRoom = async () => {
    if (!roomId || !currentUserId) return;

    try {
      // 연결 해제 핸들러 취소
      if (disconnectRef.current) {
        await disconnectRef.current.cancel();
      }

      // 멤버 정보 제거
      if (memberRef.current) {
        await remove(memberRef.current);
      }

      setIsConnected(false);
    } catch (error) {
      console.error('방 퇴장 실패:', error);
      throw error;
    }
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (isConnected) {
        leaveRoom();
      }
    };
  }, [isConnected]);

  return {
    members,
    isConnected,
    joinRoom,
    leaveRoom
  };
};