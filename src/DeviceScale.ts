import { Dimensions, PixelRatio } from 'react-native';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

// 기준 해상도 (iPhone 11 기준)
const baseWidth = 414;
const baseHeight = 896;

// 스케일 비율 계산
const widthScale = SCREEN_WIDTH / baseWidth;
const heightScale = SCREEN_HEIGHT / baseHeight;

// 너비 기준 스케일
export const scaleWidth = (size: number) => {
  const newSize = size * widthScale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// 높이 기준 스케일
export const scaleHeight = (size: number) => {
  const newSize = size * heightScale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// 텍스트 크기를 위한 더 보수적인 스케일
export const scaleFont = (size: number) => {
  const scale = Math.min(widthScale, heightScale);
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};
