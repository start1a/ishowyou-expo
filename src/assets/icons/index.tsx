import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

export const IconPlay: React.FC<IconProps> = ({ width = 24, height = 24, color = 'white' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M8 5V19L19 12L8 5Z" 
      fill={color}
    />
  </Svg>
);

export const IconPause: React.FC<IconProps> = ({ width = 24, height = 24, color = 'white' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z" 
      fill={color}
    />
  </Svg>
);

export const IconRestart: React.FC<IconProps> = ({ width = 24, height = 24, color = 'white' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22C17.52 22 22 17.52 22 12H20C20 16.42 16.42 20 12 20S4 16.42 4 12S7.58 4 12 4V7L16 3L12 -1V2Z" 
      fill={color}
    />
  </Svg>
);

export const IconRewind: React.FC<IconProps> = ({ width = 24, height = 24, color = 'white' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M12 2L7 7H10V15H14V7H17L12 2ZM6 18H18V20H6V18Z" 
      fill={color}
    />
  </Svg>
);

export const IconFastForward: React.FC<IconProps> = ({ width = 24, height = 24, color = 'white' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M12 22L17 17H14V9H10V17H7L12 22ZM18 6H6V4H18V6Z" 
      fill={color}
    />
  </Svg>
);

export const IconFullScreen: React.FC<IconProps> = ({ width = 24, height = 24, color = 'white' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M7 14H5V19H10V17H7V14ZM5 10H7V7H10V5H5V10ZM17 17H14V19H19V14H17V17ZM14 5V7H17V10H19V5H14Z" 
      fill={color}
    />
  </Svg>
);
