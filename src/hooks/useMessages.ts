import { useState, useEffect, useRef, useCallback } from 'react';
import { database } from '@src/config/firebase';
import { ref, onValue, push, set, query, orderByChild, limitToLast } from 'firebase/database';
import { ChatMessage } from '@src/api/types';

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
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useMessages = (
  roomId: string,
  currentUserId: string | undefined,
  userInfo: UserInfo | undefined
): UseMessagesReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(getTodayDateString());
  const messagesRef = useRef<any>(null);
  const previousDateRef = useRef<string | null>(null);
  const previousMessagesRef = useRef<ChatMessage[]>([]);

  // 날짜 변경 감지 (자정 체크)
  useEffect(() => {
    const checkDate = () => {
      const today = getTodayDateString();
      if (today !== currentDate) {
        // 기존 메시지를 메모리에 보관
        previousDateRef.current = currentDate;
        previousMessagesRef.current = [...messages];
        setCurrentDate(today);
      }
    };

    // 1분마다 날짜 체크
    const interval = setInterval(checkDate, 60000);
    return () => clearInterval(interval);
  }, [currentDate, messages]);

  // 메시지 실시간 리스너
  useEffect(() => {
    if (!roomId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const messagesPath = `messages/${roomId}/${currentDate}`;
    const messagesQuery = query(
      ref(database, messagesPath),
      orderByChild('createdAt'),
      limitToLast(50)
    );
    messagesRef.current = messagesQuery;

    const unsubscribe = onValue(
      messagesQuery,
      (snapshot) => {
        if (snapshot.exists()) {
          const messagesData = snapshot.val();
          const messagesList: ChatMessage[] = Object.entries(messagesData).map(
            ([id, message]) => ({
              ...(message as Omit<ChatMessage, 'id'>),
              id,
            })
          );
          // createdAt 기준 정렬
          messagesList.sort((a, b) => a.createdAt - b.createdAt);

          // 이전 날짜 메시지 + 오늘 메시지 병합 (메모리에 유지)
          if (previousMessagesRef.current.length > 0) {
            setMessages([...previousMessagesRef.current, ...messagesList]);
          } else {
            setMessages(messagesList);
          }
        } else {
          // 오늘 메시지가 없어도 이전 날짜 메시지는 유지
          if (previousMessagesRef.current.length > 0) {
            setMessages([...previousMessagesRef.current]);
          } else {
            setMessages([]);
          }
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('메시지 리스너 에러:', error);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
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
