import { Dimensions } from 'react-native';

// 화면 크기 가져오기
export const getWindowWidth = () => Dimensions.get('screen').width;
export const getWindowHeight = () => Dimensions.get('screen').height;
export const isLandscapeMode = () => getWindowWidth() > getWindowHeight();

export const calculatePlayerSize = (landscape: boolean) => {
  if (landscape) {
    return {
      width: '100%',
      height: getWindowWidth() * 0.65 / (16 / 9)
    };
  } else {
    return {
      width: '100%',
      height: getWindowWidth() / (16 / 9)
    };
  }
};

// 시간 포맷 함수 - HH:MM:SS 또는 MM:SS 형식으로 변환
export const formatTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};
