import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, PanResponder, Dimensions, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PLAYER_STATES } from 'react-native-youtube-iframe';
import { scaleHeight, scaleWidth } from '@src/DeviceScale';
import { LandscapeProgressBar } from '@src/components/ProgressBar';
import { VideoPlayerControls } from '@src/components/VideoPlayer/VideoPlayerControls';
import { VideoTimeDisplay } from '@src/components/VideoPlayer/VideoTimeDisplay';
import { FullScreenButton } from '@src/components/VideoPlayer/FullScreenButton';
import { SyncToggle } from '@src/components/VideoPlayer/SyncToggle';
import { IconShuffle, IconPlayOnce, IconPlayAll, IconRepeatOne, IconRepeatAll } from '@src/assets/icons';
import { spacing, colors, sizes } from '@/src/theme';
import { PlaybackSettings, RepeatMode } from '@src/api/types';

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
  // 동기화 관련 props
  isSyncEnabled?: boolean;
  isOwner?: boolean;
  onSyncToggle?: () => void;
  // 재생 설정 관련 props
  playbackSettings?: PlaybackSettings;
  onPlaybackSettingsChange?: (updates: Partial<PlaybackSettings>) => void;
  isAdmin?: boolean;
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
  isSyncEnabled = false,
  isOwner = false,
  onSyncToggle,
  playbackSettings,
  onPlaybackSettingsChange,
  isAdmin = false,
}: VideoPlayerOverlayProps) => {
  const insets = useSafeAreaInsets();
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

  // Repeat 모드 순환 로직
  const handleRepeatModeToggle = () => {
    if (!onPlaybackSettingsChange || !playbackSettings) return;

    const modes: RepeatMode[] = ['once', 'all', 'repeat-one', 'repeat-all'];
    const currentIndex = modes.indexOf(playbackSettings.repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;

    onPlaybackSettingsChange({ repeatMode: modes[nextIndex] });
  };

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
          {/* 좌측 상단 동기화 토글 */}
          {onSyncToggle && (
            <View
              style={[
                styles.syncToggleContainer,
                isLandscape && { top: insets.top + scaleHeight(8) }
              ]}
            >
              <SyncToggle
                isEnabled={isSyncEnabled}
                isOwner={isOwner}
                onToggle={onSyncToggle}
              />
            </View>
          )}

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

              {/* 재생 모드 컨트롤 (방장만 표시) */}
              {isAdmin && playbackSettings && onPlaybackSettingsChange && (
                <View style={styles.playbackControls}>
                  {/* Shuffle 버튼 */}
                  <TouchableOpacity
                    style={[
                      styles.playbackButton,
                      playbackSettings.shuffle && styles.playbackButtonActive
                    ]}
                    onPress={() => onPlaybackSettingsChange({
                      shuffle: !playbackSettings.shuffle
                    })}
                  >
                    <IconShuffle
                      width={20}
                      height={20}
                      color={playbackSettings.shuffle ? colors.primary : 'white'}
                    />
                  </TouchableOpacity>

                  {/* Repeat 버튼 (4가지 모드 순환) */}
                  <TouchableOpacity
                    style={[
                      styles.playbackButton,
                      playbackSettings.repeatMode !== 'once' && styles.playbackButtonActive
                    ]}
                    onPress={handleRepeatModeToggle}
                  >
                    {playbackSettings.repeatMode === 'once' ? (
                      <IconPlayOnce
                        width={20}
                        height={20}
                        color="white"
                      />
                    ) : playbackSettings.repeatMode === 'all' ? (
                      <IconPlayAll
                        width={20}
                        height={20}
                        color="white"
                      />
                    ) : playbackSettings.repeatMode === 'repeat-one' ? (
                      <IconRepeatOne
                        width={20}
                        height={20}
                        color={colors.primary}
                      />
                    ) : (
                      <IconRepeatAll
                        width={20}
                        height={20}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              )}

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
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  syncToggleContainer: {
    position: 'absolute',
    top: scaleHeight(16),
    left: scaleWidth(16),
    zIndex: 10,
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
    paddingHorizontal: scaleWidth(16),
    paddingBottom: scaleHeight(16)
  },
  progressBarLandscape: {
    paddingBottom: scaleHeight(20),
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginLeft: spacing.md,
  },
  playbackButton: {
    width: 36,
    height: 36,
    borderRadius: sizes.radiusFull,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playbackButtonActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

