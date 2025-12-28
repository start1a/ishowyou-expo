import { useState, useEffect, useRef, useCallback } from 'react';
import { database } from '@src/config/firebase';
import {
  ref,
  push,
  set,
  query,
  orderByChild,
  onChildAdded,
  off,
  startAt
} from 'firebase/database';
import { ChatMessage } from '@src/api/types';

// 방별 채팅 내역 메모리 캐시 (세션 유지용)
const chatMemoryCache: Record<string, ChatMessage[]> = {};

interface UseMessagesReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
}

interface UserInfo {
  displayName: string;
  photoURL: string | null;
}

const getTodayDateString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const useMessages = (
  roomId: string,
  currentUserId: string | undefined,
  userInfo: UserInfo | undefined
): UseMessagesReturn => {
  // 초기 상태: 캐시가 있으면 가져오고, 없으면 빈 배열
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return chatMemoryCache[roomId] || [];
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(getTodayDateString());

  // 날짜 변경 감지 (자정 체크)
  useEffect(() => {
    const interval = setInterval(() => {
      const today = getTodayDateString();
      if (today !== currentDate) {
        setCurrentDate(today);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [currentDate]);

  // 메시지 실시간 리스너 (onChildAdded)
  useEffect(() => {
    if (!roomId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const joinTime = Date.now();
    const messagesPath = `messages/${roomId}/${currentDate}`;

    // 재진입 시 구분선 추가
    if (chatMemoryCache[roomId] && chatMemoryCache[roomId].length > 0) {
      const lastMsg = chatMemoryCache[roomId][chatMemoryCache[roomId].length - 1];
      // 이미 구분선이 마지막이 아닐 때만 추가
      if (lastMsg.type !== 'system') {
        const divider: ChatMessage = {
          id: `divider-${joinTime}`,
          roomId,
          userId: 'system',
          displayName: 'System',
          photoURL: null,
          content: '여기부터 대화가 다시 시작됩니다.',
          createdAt: joinTime,
          type: 'system'
        };
        const updatedMessages = [...chatMemoryCache[roomId], divider];
        chatMemoryCache[roomId] = updatedMessages;
        setMessages(updatedMessages);
      }
    }

    // 입장 시점 이후의 메시지만 수신 (비용 최적화 핵심)
    const messagesQuery = query(
      ref(database, messagesPath),
      orderByChild('createdAt'),
      startAt(joinTime)
    );

    const handleChildAdded = (snapshot: any) => {
      if (snapshot.exists()) {
        const messageData = snapshot.val();
        const newMessage: ChatMessage = {
          ...(messageData as Omit<ChatMessage, 'id'>),
          id: snapshot.key,
        };

        setMessages((prev) => {
          // 중복 방지
          if (prev.some(m => m.id === newMessage.id)) return prev;
          const updated = [...prev, newMessage];
          chatMemoryCache[roomId] = updated; // 캐시 업데이트
          return updated;
        });
      }
    };

    onChildAdded(messagesQuery, handleChildAdded);
    setIsLoading(false);

    return () => {
      off(messagesQuery, 'child_added', handleChildAdded);
    };
  }, [roomId, currentDate]);

  // 메시지 전송
  const sendMessage = useCallback(async (content: string) => {
    if (!roomId || !currentUserId || !userInfo || !content.trim()) return;

    try {
      const messagesPath = `messages/${roomId}/${currentDate}`;
      const newMessageRef = push(ref(database, messagesPath));

      const messageData: Omit<ChatMessage, 'id'> = {
        roomId,
        userId: currentUserId,
        displayName: userInfo.displayName,
        photoURL: userInfo.photoURL,
        content: content.trim(),
        createdAt: Date.now(),
        type: 'user'
      };

      await set(newMessageRef, messageData);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      throw error;
    }
  }, [roomId, currentUserId, userInfo, currentDate]);

  return {
    messages,
    isLoading,
    sendMessage,
  };
};
