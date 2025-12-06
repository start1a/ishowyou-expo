import React from 'react';
import { Text, View, StyleProp, ViewStyle } from 'react-native';
import { scaleHeight } from '@src/DeviceScale';
import { VideoUtils } from '@src/utils/VideoUtils';

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
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      <Text style={{ color: 'white', fontSize: scaleHeight(10) }}>
        {VideoUtils.formatTime(currentTime)}
      </Text>
      <Text style={{ color: 'lightgray', fontSize: scaleHeight(10) }}>
        {`/ ${VideoUtils.formatTime(duration)}`}
      </Text>
    </View>
  );
};
