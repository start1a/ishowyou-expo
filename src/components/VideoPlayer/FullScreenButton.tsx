import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { scaleHeight, scaleWidth } from '@src/DeviceScale';
import { IconFullScreen } from '@src/assets/icons';
import { VIDEO_PLAYER_THEME } from '@src/theme/VideoPlayerTheme';


export const FullScreenButton = () => {
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
      style={styles.container}
      onPress={handleFullScreenToggle}
    >
      <IconFullScreen />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: scaleWidth(40),
    minHeight: scaleHeight(40),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: VIDEO_PLAYER_THEME.sizes.buttonRadius,
    backgroundColor: VIDEO_PLAYER_THEME.colors.overlayBackground
  }
});
