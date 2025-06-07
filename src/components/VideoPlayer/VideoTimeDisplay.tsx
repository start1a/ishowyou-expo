import React from 'react';
import { Text, View } from 'react-native';
import { scaleHeight } from '@src/DeviceScale';

interface VideoTimeDisplayProps {
  currentTime: number;
  duration: number;
  formatTime: (seconds: number) => string;
}

export const VideoTimeDisplay: React.FC<VideoTimeDisplayProps> = ({
  currentTime,
  duration,
  formatTime,
}) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ color: 'white', fontSize: scaleHeight(10) }}>
        {formatTime(currentTime)}
      </Text>
      <Text style={{ color: 'lightgray', fontSize: scaleHeight(10) }}>
        {`/ ${formatTime(duration)}`}
      </Text>
    </View>
  );
};
