import { scaleWidth } from '@/src/DeviceScale';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

interface IconProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

export const IconPlay = ({ width = scaleWidth(24), height = scaleWidth(24), color = 'white' }: IconProps) => (
  <Ionicons name="play" size={typeof width === 'number' ? width : scaleWidth(24)} color={color} />
);

export const IconPause = ({ width = scaleWidth(24), height = scaleWidth(24), color = 'white' }: IconProps) => (
  <Ionicons name="pause" size={typeof width === 'number' ? width : scaleWidth(24)} color={color} />
);

export const IconRestart = ({ width = scaleWidth(24), height = scaleWidth(24), color = 'white' }: IconProps) => (
  <Ionicons name="refresh" size={typeof width === 'number' ? width : scaleWidth(24)} color={color} />
);

export const IconRewind = ({ width = scaleWidth(24), height = scaleWidth(24), color = 'white' }: IconProps) => (
  <Ionicons name="play-back" size={typeof width === 'number' ? width : scaleWidth(24)} color={color} />
);

export const IconFastForward = ({ width = scaleWidth(24), height = scaleWidth(24), color = 'white' }: IconProps) => (
  <Ionicons name="play-forward" size={typeof width === 'number' ? width : scaleWidth(24)} color={color} />
);

export const IconFullScreen = ({ width = scaleWidth(24), height = scaleWidth(24), color = 'white' }: IconProps) => (
  <Ionicons name="expand" size={typeof width === 'number' ? width : scaleWidth(24)} color={color} />
);
