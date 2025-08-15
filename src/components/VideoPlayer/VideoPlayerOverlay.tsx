import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { PLAYER_STATES } from 'react-native-youtube-iframe';
import { scaleWidth } from '@src/DeviceScale';
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
  smallIconWidth: number;
  onToggleController: () => void;
  onPlayToggle: () => void;
  onSeekBackward: () => void;
  onSeekForward: () => void;
}

export const VideoPlayerOverlay: React.FC<VideoPlayerOverlayProps> = ({
  isControllerVisible,
  isLandscape,
  playingState,
  currentTime,
  duration,
  playHeadWidth,
  smallIconWidth,
  onToggleController,
  onPlayToggle,
  onSeekBackward,
  onSeekForward,
}) => {
  return (
    <TouchableOpacity
      style={[
        { position: 'absolute', width: '100%', height: '100%' },
        isControllerVisible && { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
      ]}
      activeOpacity={1}
      onPress={onToggleController}>
      {isControllerVisible && (
        <>
          <View style={{ flex: 1 }} />
          
          <VideoPlayerControls
            playingState={playingState}
            isLandscape={isLandscape}
            onPlayToggle={onPlayToggle}
            onSeekBackward={onSeekBackward}
            onSeekForward={onSeekForward}
          />

          <View style={{ 
            flex: 1, 
            flexDirection: 'column-reverse', 
            justifyContent: 'flex-end', 
            paddingStart: scaleWidth(16) 
          }}>
            {isLandscape && (
              <LandscapeProgressBar
                currentTime={currentTime}
                duration={duration}
                playHeadWidth={playHeadWidth}
              />
            )}
            
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'flex-end' 
            }}>
              <VideoTimeDisplay
                currentTime={currentTime}
                duration={duration}
              />

              <FullScreenButton iconSize={smallIconWidth} />
            </View>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};
