import React from 'react';
import { TouchableOpacity } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { scaleHeight, scaleWidth } from '@src/DeviceScale';
import { IconFullScreen } from '@src/assets/icons';

interface FullScreenButtonProps {
  iconSize: number;
}

export const FullScreenButton = ({ iconSize }: FullScreenButtonProps) => {
  const handleFullScreenToggle = async () => {
    try {
      const currentOrientation = await ScreenOrientation.getOrientationAsync();
      
      // Portrait 모드일 때는 가로모드로, 가로모드일 때는 Portrait로
      if (currentOrientation === ScreenOrientation.Orientation.PORTRAIT_UP || 
          currentOrientation === ScreenOrientation.Orientation.PORTRAIT_DOWN) {
        // Portrait에서 Landscape로 전환
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } else {
        // Landscape에서 Portrait로 전환
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
    } catch (error) {
      console.log('Orientation change error:', error);
    }
  };

  return (
    <TouchableOpacity
      style={{ 
        paddingEnd: scaleHeight(16), 
        paddingStart: scaleWidth(12),
        paddingVertical: scaleHeight(12),
        minWidth: scaleWidth(48),
        minHeight: scaleHeight(48),
        justifyContent: 'center',
        alignItems: 'center'
      }}
      onPress={handleFullScreenToggle}>
      <IconFullScreen
        width={iconSize}
        height={iconSize}
      />
    </TouchableOpacity>
  );
};
