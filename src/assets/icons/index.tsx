import { Ionicons } from '@expo/vector-icons';
import React from 'react';

interface IconProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

export const IconPlay = ({ width = 24, height = 24, color = 'white' }: IconProps) => (
  <Ionicons name="play" size={typeof width === 'number' ? width : 24} color={color} />
);

export const IconPause = ({ width = 24, height = 24, color = 'white' }: IconProps) => (
  <Ionicons name="pause" size={typeof width === 'number' ? width : 24} color={color} />
);

export const IconRestart = ({ width = 24, height = 24, color = 'white' }: IconProps) => (
  <Ionicons name="refresh" size={typeof width === 'number' ? width : 24} color={color} />
);

export const IconRewind = ({ width = 24, height = 24, color = 'white' }: IconProps) => (
  <Ionicons name="play-back" size={typeof width === 'number' ? width : 24} color={color} />
);

export const IconFastForward = ({ width = 24, height = 24, color = 'white' }: IconProps) => (
  <Ionicons name="play-forward" size={typeof width === 'number' ? width : 24} color={color} />
);

export const IconFullScreen = ({ width = 24, height = 24, color = 'white' }: IconProps) => (
  <Ionicons name="expand" size={typeof width === 'number' ? width : 24} color={color} />
);
