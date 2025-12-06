import { useState, useEffect, useRef, useCallback } from 'react';
import { database } from '@src/config/firebase';
import { ref, onValue, set, off } from 'firebase/database';
import { SyncState } from '@src/api/types';

interface UseVideoSyncProps {
  roomId: string;
  isOwner: boolean;
  currentTime: number;
  isPlaying: boolean;
  videoId: string;
  onSyncTimeChange?: (time: number) => void;
  onSyncPlayStateChange?: (isPlaying: boolean) => void;
}

interface UseVideoSyncReturn {
  // 방장용: 동기화 제어 활성화 여부
  isSyncControlEnabled: boolean;
  toggleSyncControl: () => void;

  // 멤버용: 동기화 따라가기 활성화 여부
  isSyncFollowEnabled: boolean;
  toggleSyncFollow: () => void;

  // 현재 동기화 상태
  syncState: SyncState | null;

  // 방장용: 즉시 동기화 업데이트 (seek/play/pause 시 사용)
  updateSyncImmediately: (time: number, playing: boolean) => void;
}

export const useVideoSync = ({
  roomId,
  isOwner,
  currentTime,
  isPlaying,
  videoId,
  onSyncTimeChange,
  onSyncPlayStateChange,
}: UseVideoSyncProps): UseVideoSyncReturn => {
  // 방장: 동기화 제어 On/Off
  const [isSyncControlEnabled, setIsSyncControlEnabled] = useState(false);

  // 멤버: 동기화 따라가기 On/Off
  const [isSyncFollowEnabled, setIsSyncFollowEnabled] = useState(false);

  // Firebase에서 받아온 동기화 상태
  const [syncState, setSyncState] = useState<SyncState | null>(null);

  const syncRef = useRef<any>(null);
  const lastUpdateRef = useRef<number>(0);

  // 동기화 업데이트 간격 (너무 자주 업데이트하지 않도록)
  const UPDATE_INTERVAL = 1000; // 1초

  // Firebase sync 경로 설정 (독립된 sync 컬렉션 사용)
  useEffect(() => {
    if (!roomId) return;

    const syncPath = `sync/${roomId}`;
    syncRef.current = ref(database, syncPath);

    // 동기화 상태 리스너
    const unsubscribe = onValue(syncRef.current, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as SyncState;
        setSyncState(data);

        // 방장이 동기화 제어 활성화 상태를 로컬에 반영
        if (isOwner) {
          setIsSyncControlEnabled(data.isEnabled);
        }
      } else {
        setSyncState(null);
        if (isOwner) {
          setIsSyncControlEnabled(false);
        }
      }
    });

    return () => {
      if (syncRef.current) {
        off(syncRef.current, 'value', unsubscribe);
      }
    };
  }, [roomId, isOwner]);

  // 방장: 동기화 상태를 Firebase에 업데이트
  useEffect(() => {
    if (!isOwner || !isSyncControlEnabled || !syncRef.current) return;

    const now = Date.now();
    if (now - lastUpdateRef.current < UPDATE_INTERVAL) return;

    lastUpdateRef.current = now;

    const syncData: SyncState = {
      isEnabled: true,
      currentTime,
      isPlaying,
      videoId,
      updatedAt: now,
    };

    set(syncRef.current, syncData).catch((error) => {
      console.error('동기화 상태 업데이트 실패:', error);
    });
  }, [isOwner, isSyncControlEnabled, currentTime, isPlaying, videoId]);

  // 멤버: 동기화 상태 변경 시 콜백 호출
  useEffect(() => {
    if (isOwner || !isSyncFollowEnabled || !syncState?.isEnabled) return;

    // 오래된 데이터(5초 이상)는 무시
    const dataAge = Date.now() - syncState.updatedAt;
    if (dataAge > 5000) return;

    // 네트워크 지연 보정: 재생 중이면 지연 시간만큼 보정
    const networkDelay = dataAge / 1000;
    const adjustedTime = syncState.isPlaying
      ? syncState.currentTime + networkDelay
      : syncState.currentTime;

    // 시간 차이가 1초 이상일 때만 동기화
    const timeDiff = Math.abs(adjustedTime - currentTime);
    if (timeDiff > 1) {
      onSyncTimeChange?.(adjustedTime);
    }

    // 재생 상태가 다르면 동기화
    if (syncState.isPlaying !== isPlaying) {
      onSyncPlayStateChange?.(syncState.isPlaying);
    }
  }, [syncState, isSyncFollowEnabled, isOwner, currentTime, isPlaying, onSyncTimeChange, onSyncPlayStateChange]);

  // 방장: 동기화 제어 토글
  const toggleSyncControl = useCallback(async () => {
    if (!isOwner || !syncRef.current) return;

    const newEnabled = !isSyncControlEnabled;
    setIsSyncControlEnabled(newEnabled);

    if (newEnabled) {
      // 동기화 활성화: 현재 상태 저장
      const syncData: SyncState = {
        isEnabled: true,
        currentTime,
        isPlaying,
        videoId,
        updatedAt: Date.now(),
      };
      await set(syncRef.current, syncData);
    } else {
      // 동기화 비활성화: isEnabled만 false로 변경 (멤버는 현재 상태 유지)
      const syncData: SyncState = {
        isEnabled: false,
        currentTime,
        isPlaying,
        videoId,
        updatedAt: Date.now(),
      };
      await set(syncRef.current, syncData);
    }
  }, [isOwner, isSyncControlEnabled, currentTime, isPlaying, videoId]);

  // 멤버: 동기화 따라가기 토글
  const toggleSyncFollow = useCallback(() => {
    if (isOwner) return;

    const newEnabled = !isSyncFollowEnabled;
    setIsSyncFollowEnabled(newEnabled);

    // 동기화 켤 때 즉시 현재 동기화 시간으로 이동
    if (newEnabled && syncState?.isEnabled) {
      onSyncTimeChange?.(syncState.currentTime);
      if (syncState.isPlaying !== isPlaying) {
        onSyncPlayStateChange?.(syncState.isPlaying);
      }
    }
  }, [isOwner, isSyncFollowEnabled, syncState, isPlaying, onSyncTimeChange, onSyncPlayStateChange]);

  // 방장: 즉시 동기화 업데이트 (seek/play/pause 시 사용)
  const updateSyncImmediately = useCallback((time: number, playing: boolean) => {
    if (!isOwner || !isSyncControlEnabled || !syncRef.current) return;

    const syncData: SyncState = {
      isEnabled: true,
      currentTime: time,
      isPlaying: playing,
      videoId,
      updatedAt: Date.now(),
    };

    lastUpdateRef.current = Date.now();
    set(syncRef.current, syncData).catch((error) => {
      console.error('즉시 동기화 업데이트 실패:', error);
    });
  }, [isOwner, isSyncControlEnabled, videoId]);

  return {
    isSyncControlEnabled,
    toggleSyncControl,
    isSyncFollowEnabled,
    toggleSyncFollow,
    syncState,
    updateSyncImmediately,
  };
};
