import React from 'react';
import { Text, View } from 'react-native';
import { scaleHeight } from '@src/DeviceScale';
import { VideoUtils } from '@src/utils/VideoUtils';

interface VideoTimeDisplayProps {
  currentTime: number;
  duration: number;
}

export const VideoTimeDisplay: React.FC<VideoTimeDisplayProps> = ({
  currentTime,
  duration,
}) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ color: 'white', fontSize: scaleHeight(10) }}>
        {VideoUtils.formatTime(currentTime)}
      </Text>
      <Text style={{ color: 'lightgray', fontSize: scaleHeight(10) }}>
        {`/ ${VideoUtils.formatTime(duration)}`}
      </Text>
    </View>
  );
};
