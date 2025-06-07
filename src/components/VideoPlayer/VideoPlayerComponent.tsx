import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import YoutubePlayer, { PLAYER_STATES, YoutubeIframeRef } from 'react-native-youtube-iframe';
import { VideoPlayerOverlay } from './VideoPlayerOverlay';
import { scaleHeight, scaleWidth } from '@src/DeviceScale';
import { useOrientation } from '@/src/hooks/useOrientation';
import { usePlayerSize } from '@/src/hooks/usePlayerSize';

interface VideoPlayerComponentProps {
  videoId: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export const VideoPlayerComponent: React.FC<VideoPlayerComponentProps> = ({
  videoId,
  onTimeUpdate,
}) => {
  const playerRef = useRef<YoutubeIframeRef>(null);
  const isLandscape = useOrientation();
  const playerSize = usePlayerSize();
  
  // 비디오 상태
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [playingState, setPlayingState] = useState<PLAYER_STATES>(PLAYER_STATES.UNSTARTED);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const timeUpdateInterval = useRef<any>(null);

  // UI 상태
  const [isControllerVisible, setIsControllerVisible] = useState(true);

  // 상수
  const WIDTH_SMALL_ICON = scaleHeight(20);
  const WIDTH_PLAY_HEAD = scaleWidth(15);

  // 이벤트 핸들러
  const onStateChange = useCallback((state: PLAYER_STATES) => {
    console.log('Player state:', state);
    setPlayingState(state);
    if (state === PLAYER_STATES.ENDED) {
      setIsEnded(true);
      setIsPlaying(false);
    }
  }, []);

  const handlePlayToggle = useCallback(() => {
    if (isEnded) {
      playerRef.current?.seekTo(0, true);
      setIsPlaying(true);
      setIsEnded(false);
    } else {
      setIsPlaying(prev => !prev);
    }
  }, [isEnded]);

  const seekTo = async (seconds: number) => {
    const currentTime = await playerRef.current?.getCurrentTime();
    if (!currentTime) return;
    if (currentTime >= duration - 1) return;

    const newTime = currentTime + seconds;
    playerRef.current?.seekTo(
      newTime > duration ? Math.trunc(duration - 1) : newTime, 
      true
    );
  };

  const handleSeekBackward = () => seekTo(-10);
  const handleSeekForward = () => seekTo(10);

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
        flex: 65,
        maxWidth: '65%'
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
        height={playerSize.height}
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
        smallIconWidth={WIDTH_SMALL_ICON}
        onToggleController={() => setIsControllerVisible(prev => !prev)}
        onPlayToggle={handlePlayToggle}
        onSeekBackward={handleSeekBackward}
        onSeekForward={handleSeekForward}
      />
    </View>
  );
};
