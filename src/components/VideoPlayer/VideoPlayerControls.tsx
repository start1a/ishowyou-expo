import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { PLAYER_STATES } from 'react-native-youtube-iframe';
import { scaleHeight } from '@src/DeviceScale';
import {
  IconFastForward,
  IconPause,
  IconPlay,
  IconRestart,
  IconRewind
} from '@src/assets/icons';
import { VIDEO_PLAYER_THEME } from '@src/theme/VideoPlayerTheme';

interface VideoPlayerControlsProps {
  playingState: PLAYER_STATES;
  isLandscape: boolean;
  onPlayToggle: () => void;
  onSeekBackward: () => void;
  onSeekForward: () => void;
}

export const VideoPlayerControls = ({
  playingState,
  isLandscape,
  onPlayToggle,
  onSeekBackward,
  onSeekForward,
}: VideoPlayerControlsProps) => {
  const WIDTH_ICON_PLAY = isLandscape ? '70%' : '50%';

  const renderPlayingIcon = () => {
    switch (playingState) {
      case PLAYER_STATES.PLAYING:
        return (
          <IconPause
            width={WIDTH_ICON_PLAY}
            height={WIDTH_ICON_PLAY}
          />
        );
      case PLAYER_STATES.UNSTARTED:
      case PLAYER_STATES.PAUSED:
        return (
          <IconPlay
            width={WIDTH_ICON_PLAY}
            height={WIDTH_ICON_PLAY}
          />
        );
      case PLAYER_STATES.ENDED:
        return (
          <IconRestart
            width={WIDTH_ICON_PLAY}
            height={WIDTH_ICON_PLAY}
          />
        );
      case PLAYER_STATES.BUFFERING:
        return (
          <ActivityIndicator size="large" color="white" />
        );
      default:
        return (
          <IconPlay
            width={WIDTH_ICON_PLAY}
            height={WIDTH_ICON_PLAY}
          />
        );
    }
  };

  return (
    <View style={{
      flex: 4,
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center'
    }}>
      <TouchableOpacity
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          width: scaleHeight(72),
          height: scaleHeight(72),
          borderRadius: VIDEO_PLAYER_THEME.sizes.buttonRadius,
          backgroundColor: VIDEO_PLAYER_THEME.colors.overlayBackground
        }}
        onPress={onSeekBackward}>
        <IconRewind
          width={WIDTH_ICON_PLAY}
          height={WIDTH_ICON_PLAY}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          width: scaleHeight(72),
          height: scaleHeight(72),
          borderRadius: VIDEO_PLAYER_THEME.sizes.buttonRadius,
          backgroundColor: VIDEO_PLAYER_THEME.colors.overlayBackground
        }}
        onPress={onPlayToggle}>
        {renderPlayingIcon()}
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          width: scaleHeight(72),
          height: scaleHeight(72),
          borderRadius: VIDEO_PLAYER_THEME.sizes.buttonRadius,
          backgroundColor: VIDEO_PLAYER_THEME.colors.overlayBackground
        }}
        onPress={onSeekForward}>
        <IconFastForward
          width={WIDTH_ICON_PLAY}
          height={WIDTH_ICON_PLAY}
        />
      </TouchableOpacity>
    </View>
  );
};
