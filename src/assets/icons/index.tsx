import React from 'react';
import { SvgProps } from 'react-native-svg';
import { sizes } from '@/src/theme';

// SVG 아이콘 import
import IconPlaySvg from './svg/icon-play.svg';
import IconPauseSvg from './svg/icon-pause.svg';
import IconRewindSvg from './svg/icon-rewind.svg';
import IconFastForwardSvg from './svg/icon-fast-forward.svg';
import IconFullScreenSvg from './svg/icon-fullscreen.svg';
import IconRefreshSvg from './svg/icon-refresh.svg';

interface IconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
}

export const IconPlay = ({ width = sizes.iconMd, height = sizes.iconMd, color = 'white', ...props }: IconProps) => (
  <IconPlaySvg width={width} height={height} fill={color} {...props} />
);

export const IconPause = ({ width = sizes.iconMd, height = sizes.iconMd, color = 'white', ...props }: IconProps) => (
  <IconPauseSvg width={width} height={height} fill={color} {...props} />
);

export const IconRestart = ({ width = sizes.iconMd, height = sizes.iconMd, color = 'white', ...props }: IconProps) => (
  <IconRefreshSvg width={width} height={height} stroke={color} fill={color} {...props} />
);

export const IconRewind = ({ width = sizes.iconMd, height = sizes.iconMd, color = 'white', ...props }: IconProps) => (
  <IconRewindSvg width={width} height={height} stroke={color} {...props} />
);

export const IconFastForward = ({ width = sizes.iconMd, height = sizes.iconMd, color = 'white', ...props }: IconProps) => (
  <IconFastForwardSvg width={width} height={height} stroke={color} {...props} />
);

export const IconFullScreen = ({ width = sizes.iconMd, height = sizes.iconMd, color = 'white', ...props }: IconProps) => (
  <IconFullScreenSvg width={width} height={height} stroke={color} {...props} />
);
