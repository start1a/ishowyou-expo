import React from 'react';
import { Text, View, StyleProp, ViewStyle } from 'react-native';
import { scaleHeight } from '@src/DeviceScale';
import { VideoUtils } from '@src/utils/VideoUtils';
import { VIDEO_PLAYER_THEME } from '@src/theme/VideoPlayerTheme';

interface VideoTimeDisplayProps {
  currentTime: number;
  duration: number;
  style?: StyleProp<ViewStyle>;
}

export const VideoTimeDisplay = ({
  currentTime,
  duration,
  style
}: VideoTimeDisplayProps) => {
  return (
    <View style={[{
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: VIDEO_PLAYER_THEME.sizes.timePillRadius,
      backgroundColor: VIDEO_PLAYER_THEME.colors.overlayBackground,
      paddingHorizontal: scaleHeight(12),
      paddingVertical: scaleHeight(4),
    }, style]}>
      <Text style={{ color: VIDEO_PLAYER_THEME.colors.text, fontSize: scaleHeight(10) }}>
        {VideoUtils.formatTime(currentTime)}
      </Text>
      <Text style={{ color: VIDEO_PLAYER_THEME.colors.textSecondary, fontSize: scaleHeight(10) }}>
        {`/ ${VideoUtils.formatTime(duration)}`}
      </Text>
    </View>
  );
};
