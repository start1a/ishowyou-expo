import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, PanResponder, Dimensions } from 'react-native';
import { PLAYER_STATES } from 'react-native-youtube-iframe';
import { scaleHeight, scaleWidth } from '@src/DeviceScale';
import { LandscapeProgressBar } from '@src/components/ProgressBar';
import { VideoPlayerControls } from '@src/components/VideoPlayer/VideoPlayerControls';
import { VideoTimeDisplay } from '@src/components/VideoPlayer/VideoTimeDisplay';
import { FullScreenButton } from '@src/components/VideoPlayer/FullScreenButton';

interface VideoPlayerOverlayProps {
  isControllerVisible: boolean;
  isLandscape: boolean;
  playingState: PLAYER_STATES;
  currentTime: number;
  duration: number;
  playHeadWidth: number;
  onToggleController: () => void;
  onPlayToggle: () => void;
  onSeekBackward: () => void;
  onSeekForward: () => void;
  onDragStart: () => void;
  onDragUpdate: (time: number) => void;
  onDragEnd: (time: number) => void;
}

export const VideoPlayerOverlay = ({
  isControllerVisible,
  isLandscape,
  playingState,
  currentTime,
  duration,
  playHeadWidth,
  onToggleController,
  onPlayToggle,
  onSeekBackward,
  onSeekForward,
  onDragStart,
  onDragUpdate,
  onDragEnd,
}: VideoPlayerOverlayProps) => {
  const isDragging = useRef(false);
  const startDragTime = useRef(0);
  const latestDragTime = useRef(0);

  // Stale Closure 방지를 위한 Refs
  const currentTimeRef = useRef(currentTime);
  const durationRef = useRef(duration);

  // Callback Refs
  const onDragStartRef = useRef(onDragStart);
  const onDragUpdateRef = useRef(onDragUpdate);
  const onDragEndRef = useRef(onDragEnd);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  // Sync Callback Refs
  useEffect(() => {
    onDragStartRef.current = onDragStart;
    onDragUpdateRef.current = onDragUpdate;
    onDragEndRef.current = onDragEnd;
  }, [onDragStart, onDragUpdate, onDragEnd]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        return Math.abs(dx) > 10 || Math.abs(dy) > 10;
      },
      onPanResponderGrant: () => {
        isDragging.current = false;
        // 터치 시작 시점의 최신 currentTime 사용
        startDragTime.current = currentTimeRef.current;
        latestDragTime.current = currentTimeRef.current;
      },
      onPanResponderMove: (_, gestureState) => {
        const { dx } = gestureState;
        const currentDuration = durationRef.current;
        const currentScreenWidth = Dimensions.get('window').width;

        // 드래그 거리 10 이상일 때 드래그 시작으로 간주
        if (!isDragging.current && Math.abs(dx) > 10) {
          isDragging.current = true;
          onDragStartRef.current();
        }

        if (isDragging.current) {
          // 화면 너비 = 비디오 전체 길이로 매핑
          const deltaSeconds = (dx / currentScreenWidth) * currentDuration;
          const newTime = Math.max(0, Math.min(currentDuration, startDragTime.current + deltaSeconds));

          latestDragTime.current = newTime;
          onDragUpdateRef.current(newTime);
        }
      },
      onPanResponderRelease: () => {
        if (isDragging.current) {
          isDragging.current = false;
          onDragEndRef.current(latestDragTime.current);
        } else {
          // 드래그가 아니면 탭 제스처 처리
          onToggleController();
        }
      },
    })
  ).current;

  return (
    <View
      style={[
        styles.container,
        isControllerVisible && styles.containerVisible
      ]}
      hitSlop={{ top: 20, bottom: 20 }}
      {...panResponder.panHandlers}
    >
      {isControllerVisible && (
        <>
          <View style={{ flex: 1 }}>
            <VideoPlayerControls
              playingState={playingState}
              isLandscape={isLandscape}
              onPlayToggle={onPlayToggle}
              onSeekBackward={onSeekBackward}
              onSeekForward={onSeekForward}
            />
          </View>

          <View style={styles.bottomControlsContainer}>
            <View style={styles.bottomControlsRow}>
              <VideoTimeDisplay
                currentTime={currentTime}
                duration={duration}
              />

              <FullScreenButton />
            </View>

            {isLandscape && (
              <LandscapeProgressBar
                currentTime={currentTime}
                duration={duration}
                playHeadWidth={playHeadWidth}
                style={styles.progressBarLandscape}
              />
            )}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  containerVisible: {
    backgroundColor: 'transparent', // 투명 배경 유지
    // TouchableOpacity 때는 필요 없었지만 View는 기본적으로 터치를 막지 않음.
    // 하지만 PanResponder가 이벤트를 가로채므로 상관없음.
    // 기존에 투명이었던 이유는 뒤의 비디오를 가리지 않기 위함.
    // 여기서도 backgroundColor는 transparent여야 함.
    // 하지만 controls나 overlay가 있으면 반투명 배경이 있을 수 있음.
    // 기존 코드에서는 'transparent' 였음.
  },
  bottomControlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%'
  },
  bottomControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: scaleWidth(20),
    paddingBottom: scaleHeight(16)
  },
  progressBarLandscape: {
    paddingBottom: scaleHeight(20),
  }
});

