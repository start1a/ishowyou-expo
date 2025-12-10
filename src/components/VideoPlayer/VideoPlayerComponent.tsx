import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import YoutubePlayer, { PLAYER_STATES, YoutubeIframeRef } from 'react-native-youtube-iframe';
import { VideoPlayerOverlay } from '@src/components/VideoPlayer/VideoPlayerOverlay';
import { scaleHeight, scaleWidth } from '@src/DeviceScale';
import { useOrientation } from '@src/hooks/useOrientation';
import { usePlayerSize } from '@src/hooks/usePlayerSize';

interface VideoPlayerComponentProps {
  videoId: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  // 재생 상태 제어 (상위 컴포넌트에서 관리)
  isPlaying?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
  // 동기화 관련 props
  isSyncEnabled?: boolean;
  isOwner?: boolean;
  onSyncToggle?: () => void;
  syncTime?: number;
  syncIsPlaying?: boolean;
  // 방장용: 즉시 동기화 업데이트
  onSyncUpdate?: (time: number, isPlaying: boolean) => void;
}

export const VideoPlayerComponent = ({
  videoId,
  onTimeUpdate,
  isPlaying: externalIsPlaying,
  onPlayStateChange,
  isSyncEnabled,
  isOwner,
  onSyncToggle,
  syncTime,
  syncIsPlaying,
  onSyncUpdate,
}: VideoPlayerComponentProps) => {
  const playerRef = useRef<YoutubeIframeRef>(null);
  const isLandscape = useOrientation();
  const { playerHeight } = usePlayerSize();

  // 비디오 상태 (외부 제어 또는 내부 상태)
  const [internalIsPlaying, setInternalIsPlaying] = useState(false);
  const isPlaying = externalIsPlaying !== undefined ? externalIsPlaying : internalIsPlaying;

  const setIsPlaying = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    const newValue = typeof value === 'function' ? value(isPlaying) : value;
    setInternalIsPlaying(newValue);
    onPlayStateChange?.(newValue);
  }, [isPlaying, onPlayStateChange]);
  const [isEnded, setIsEnded] = useState(false);
  const [playingState, setPlayingState] = useState<PLAYER_STATES>(PLAYER_STATES.UNSTARTED);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const timeUpdateInterval = useRef<any>(null);

  // UI 상태
  const [isControllerVisible, setIsControllerVisible] = useState(true);

  // 상수
  const WIDTH_PLAY_HEAD = scaleWidth(15);

  // 이벤트 핸들러
  const onStateChange = useCallback((state: PLAYER_STATES) => {
    console.log('Player state:', state);
    setPlayingState(state);

    // 상태가 변했다는 것은 로딩/재생 등이 시작되었다는 의미이므로 seeking 상태 해제
    if (state === PLAYER_STATES.PLAYING || state === PLAYER_STATES.PAUSED) {
      setIsSeeking(false);
    }

    if (state === PLAYER_STATES.ENDED) {
      setIsEnded(true);
      setIsPlaying(false);
    }
  }, []);

  const handlePlayToggle = useCallback(() => {
    let newPlaying: boolean;
    let newTime = currentTime;

    if (isEnded) {
      playerRef.current?.seekTo(0, true);
      setIsPlaying(true);
      setIsEnded(false);
      newPlaying = true;
      newTime = 0;
    } else {
      newPlaying = !isPlaying;
      setIsPlaying(newPlaying);
    }

    // 방장: 즉시 동기화 업데이트
    if (isOwner && isSyncEnabled) {
      onSyncUpdate?.(newTime, newPlaying);
    }
  }, [isEnded, isPlaying, currentTime, isOwner, isSyncEnabled, onSyncUpdate]);

  const seekTo = useCallback((seconds: number) => {
    // 1. 현재 State의 시간 기반으로 계산 (비동기 제거)
    // 2. Optimistic Update: UI 먼저 갱신
    if (currentTime >= duration - 1 && seconds > 0) return;

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));

    // UI 즉시 업데이트 및 Seeking 상태 설정
    setCurrentTime(newTime);
    setIsSeeking(true);

    // 실제 플레이어 이동
    playerRef.current?.seekTo(newTime, true);

    // 방장: 즉시 동기화 업데이트
    if (isOwner && isSyncEnabled) {
      onSyncUpdate?.(newTime, isPlaying);
    }

    // 안전장치: 1초 후에도 상태 변화가 없으면 seeking 해제
    setTimeout(() => {
      setIsSeeking(false);
    }, 1000);
  }, [currentTime, duration, isOwner, isSyncEnabled, isPlaying, onSyncUpdate]);

  const handleSeekBackward = () => seekTo(-10);
  const handleSeekForward = () => seekTo(10);

  // 드래그 제스처 핸들러
  const handleDragStart = useCallback(() => {
    setIsSeeking(true);
  }, []);

  const handleDragUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleDragEnd = useCallback((time: number) => {
    setIsSeeking(false);
    playerRef.current?.seekTo(time, true);

    // 방장: 즉시 동기화 업데이트
    if (isOwner && isSyncEnabled) {
      onSyncUpdate?.(time, isPlaying);
    }
  }, [isOwner, isSyncEnabled, isPlaying, onSyncUpdate]);

  // 멤버: 동기화 시간 변경 시 시간 이동
  useEffect(() => {
    if (syncTime !== undefined && !isOwner && isSyncEnabled) {
      const timeDiff = Math.abs(syncTime - currentTime);
      if (timeDiff > 2) {
        setCurrentTime(syncTime);
        playerRef.current?.seekTo(syncTime, true);
      }
    }
  }, [syncTime, isOwner, isSyncEnabled]);

  // 멤버: 동기화 재생 상태 변경 시 재생/일시정지
  useEffect(() => {
    if (syncIsPlaying !== undefined && !isOwner && isSyncEnabled) {
      if (syncIsPlaying !== isPlaying) {
        setIsPlaying(syncIsPlaying);
      }
    }
  }, [syncIsPlaying, isOwner, isSyncEnabled]);

  // 비디오 시간 정보 업데이트
  useEffect(() => {
    const getVideoDetails = async () => {
      try {
        const videoDuration = await playerRef.current?.getDuration();
        if (videoDuration) {
          // console.log(`Video duration: ${videoDuration}`);
          setDuration(videoDuration);
          onTimeUpdate?.(currentTime, videoDuration);
        }
      } catch (error) {
        console.log('Error getting video duration:', error);
      }
    };

    if (playingState === PLAYER_STATES.PLAYING) {
      getVideoDetails();

      timeUpdateInterval.current = setInterval(async () => {
        if (!isSeeking) {
          try {
            const time = await playerRef.current?.getCurrentTime();
            if (time !== undefined) {
              setCurrentTime(time);
              onTimeUpdate?.(time, duration);
            }
          } catch (error) {
            console.log('Error getting current time:', error);
          }
        }
      }, 100);
    } else {
      clearInterval(timeUpdateInterval.current);
    }

    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
    };
  }, [playingState, isSeeking, currentTime, duration, onTimeUpdate]);

  return (
    <View style={[
      isLandscape && {
        justifyContent: 'center',
        flex: 60,
        maxWidth: '60%'
      },
      { backgroundColor: 'black' }
    ]}>
      <YoutubePlayer
        webViewStyle={isLandscape && { width: '100%', alignSelf: 'center' }}
        initialPlayerParams={{
          controls: false,
          showClosedCaptions: false,
          preventFullScreen: true,
          rel: false,
          iv_load_policy: 3
        }}
        ref={playerRef}
        height={playerHeight}
        play={isPlaying}
        videoId={videoId}
        onChangeState={onStateChange}
      />

      <VideoPlayerOverlay
        isControllerVisible={isControllerVisible}
        isLandscape={isLandscape}
        playingState={playingState}
        currentTime={currentTime}
        duration={duration}
        playHeadWidth={WIDTH_PLAY_HEAD}
        onToggleController={() => setIsControllerVisible(prev => !prev)}
        onPlayToggle={handlePlayToggle}
        onSeekBackward={handleSeekBackward}
        onSeekForward={handleSeekForward}
        onDragStart={handleDragStart}
        onDragUpdate={handleDragUpdate}
        onDragEnd={handleDragEnd}
        isSyncEnabled={isSyncEnabled}
        isOwner={isOwner}
        onSyncToggle={onSyncToggle}
      />
    </View>
  );
};
