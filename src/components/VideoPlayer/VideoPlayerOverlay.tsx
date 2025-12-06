import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
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
}: VideoPlayerOverlayProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isControllerVisible && styles.containerVisible
      ]}
      activeOpacity={1}
      onPress={onToggleController}>
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  containerVisible: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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

