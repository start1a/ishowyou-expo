import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, LayoutChangeEvent } from 'react-native';
import { scaleHeight, scaleWidth } from '@src/DeviceScale';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  playHeadWidth: number;
  playerHeight?: number;
  style?: any;
}

export const PortraitProgressBar = ({
  currentTime,
  duration,
  playHeadWidth,
  playerHeight = 0,
  style
}: ProgressBarProps) => {
  const progress = duration > 0 ? currentTime / duration : 0;
  const screenWidth = Dimensions.get('window').width;

  const TRACK_HEIGHT = scaleHeight(4);

  // 재생 헤드 위치 계산
  // 1. 기본적으로 진행된 길이(screenWidth * progress)의 끝에 헤드의 오른쪽 끝이 위치해야 함
  //    따라서 (screenWidth * progress) - playHeadWidth 가 기본 위치
  // 2. 0초일 때(progress가 0에 가까울 때)는 헤드가 0보다 작아지면 안됨 -> Math.max(0, ...)
  const playHeadLeft = Math.max(0, (screenWidth * progress) - playHeadWidth);

  return (
    <View style={[styles.portraitContainer, { top: playerHeight - (TRACK_HEIGHT / 2) }, style]}>
      <View style={[styles.progressTrack, { width: screenWidth, height: TRACK_HEIGHT }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress * 100}%`,
            }
          ]}
        />
        <View
          style={[
            styles.playHead,
            {
              width: playHeadWidth,
              height: playHeadWidth,
              left: playHeadLeft
            }
          ]}
        />
      </View>
    </View>
  );
};

export const LandscapeProgressBar = ({
  currentTime,
  duration,
  playHeadWidth,
  style
}: ProgressBarProps) => {
  const progress = duration > 0 ? currentTime / duration : 0;
  const [trackWidth, setTrackWidth] = useState(0);

  const TRACK_HEIGHT = playHeadWidth / 3;

  const onLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  // 재생 헤드 위치 계산 (Portrait와 동일한 로직)
  const headCenter = trackWidth * progress;
  const playHeadLeft = Math.max(0, Math.min(trackWidth - playHeadWidth, headCenter - playHeadWidth / 2));
  const playHeadTop = (TRACK_HEIGHT - playHeadWidth) / 2;

  return (
    <View style={[styles.landscapeContainer, style]}>
      <View style={[styles.progressTrack, { height: TRACK_HEIGHT }]} onLayout={onLayout}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress * 100}%`,
            }
          ]}
        />
        <View
          style={[
            styles.playHead,
            {
              width: playHeadWidth,
              height: playHeadWidth,
              left: playHeadLeft,
              top: playHeadTop,
              transform: [] // 스타일에서 기본 transform 제거
            }
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  portraitContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 0,
    zIndex: 100,
  },
  landscapeContainer: {
    paddingHorizontal: scaleWidth(20),
  },
  progressTrack: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: scaleHeight(2),
    position: 'relative',
    height: scaleHeight(4), // 일관성을 위해 정의된 가로 모드 높이
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF0000',
    borderRadius: scaleHeight(2),
    position: 'relative',
  },
  playHead: {
    backgroundColor: '#FF0000',
    borderRadius: 50,
    position: 'absolute',
    transform: [{ translateY: -scaleHeight(6) }],
    // 트랙을 기준으로 수직 중앙 정렬 (트랙 높이 4, 헤드는 보통 더 큼)
    // 참고: 헤드가 15면 절반은 7.5. 트랙은 4. 중앙은 2.
    // 헤드 상단은 2 - 7.5 = -5.5 위치여야 함.
    // 이전 transform은 -6이었으며, 충분히 근사함.
  },
});
