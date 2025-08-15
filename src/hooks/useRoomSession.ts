import { useState, useEffect, useRef } from 'react';
import { database } from '@src/config/firebase';
import { ref, onValue, off, set, update, remove, serverTimestamp, onDisconnect } from 'firebase/database';
import { SessionMember, RoomSession } from '@src/api/types';

interface UseRoomSessionReturn {
  sessionMembers: SessionMember[];
  isConnected: boolean;
  joinSession: (memberInfo: Omit<SessionMember, 'id' | 'isOnline' | 'lastSeen' | 'joinedAt'>) => Promise<void>;
  leaveSession: () => Promise<void>;
  updateMemberStatus: (status: Partial<Pick<SessionMember, 'isOnline' | 'lastSeen'>>) => Promise<void>;
}

export const useRoomSession = (roomId: string, currentUserId?: string): UseRoomSessionReturn => {
  const [sessionMembers, setSessionMembers] = useState<SessionMember[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const sessionRef = useRef<any>(null);
  const memberRef = useRef<any>(null);
  const disconnectRef = useRef<any>(null);

  // 세션 데이터 실시간 리스너 설정
  useEffect(() => {
    if (!roomId) return;

    const sessionPath = `sessions/${roomId}`;
    sessionRef.current = ref(database, sessionPath);

    const unsubscribe = onValue(sessionRef.current, (snapshot) => {
      if (snapshot.exists()) {
        const sessionData: RoomSession = snapshot.val();
        const members = Object.entries(sessionData.members || {}).map(([id, member]) => ({
          ...member as SessionMember,
          id
        }));
        setSessionMembers(members);
      } else {
        setSessionMembers([]);
      }
    });

    return () => {
      if (sessionRef.current) {
        off(sessionRef.current, 'value', unsubscribe);
      }
    };
  }, [roomId]);

  // 세션 참여
  const joinSession = async (memberInfo: Omit<SessionMember, 'id' | 'isOnline' | 'lastSeen' | 'joinedAt'>) => {
    if (!roomId || !currentUserId) return;

    try {
      const now = Date.now();
      const memberPath = `sessions/${roomId}/members/${currentUserId}`;
      memberRef.current = ref(database, memberPath);

      const memberData: SessionMember = {
        ...memberInfo,
        id: currentUserId,
        isOnline: true,
        lastSeen: now,
        joinedAt: now
      };

      // 멤버 정보 설정
      await set(memberRef.current, memberData);

      // 세션 메타데이터 업데이트
      const sessionMetaPath = `sessions/${roomId}`;
      await update(ref(database, sessionMetaPath), {
        updatedAt: serverTimestamp()
      });

      // 연결 해제 시 자동으로 오프라인 처리
      disconnectRef.current = onDisconnect(memberRef.current);
      await disconnectRef.current.update({
        isOnline: false,
        lastSeen: serverTimestamp()
      });

      setIsConnected(true);
    } catch (error) {
      console.error('세션 참여 실패:', error);
      throw error;
    }
  };

  // 세션 퇴장
  const leaveSession = async () => {
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

      // 세션 메타데이터 업데이트
      const sessionMetaPath = `sessions/${roomId}`;
      await update(ref(database, sessionMetaPath), {
        updatedAt: serverTimestamp()
      });

      setIsConnected(false);
    } catch (error) {
      console.error('세션 퇴장 실패:', error);
      throw error;
    }
  };

  // 멤버 상태 업데이트
  const updateMemberStatus = async (status: Partial<Pick<SessionMember, 'isOnline' | 'lastSeen'>>) => {
    if (!roomId || !currentUserId || !memberRef.current) return;

    try {
      await update(memberRef.current, {
        ...status,
        lastSeen: status.lastSeen || serverTimestamp()
      });
    } catch (error) {
      console.error('멤버 상태 업데이트 실패:', error);
      throw error;
    }
  };

  // 컴포넌트 언마운트 시 세션 정리
  useEffect(() => {
    return () => {
      if (isConnected) {
        leaveSession();
      }
    };
  }, [isConnected]);

  return {
    sessionMembers,
    isConnected,
    joinSession,
    leaveSession,
    updateMemberStatus
  };
};