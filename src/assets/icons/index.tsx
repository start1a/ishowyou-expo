import { Ionicons } from '@expo/vector-icons';
import React from 'react';

interface IconProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

export const IconPlay: React.FC<IconProps> = ({ width = 24, height = 24, color = 'white' }) => (
  <Ionicons name="play" size={typeof width === 'number' ? width : 24} color={color} />
);

export const IconPause: React.FC<IconProps> = ({ width = 24, height = 24, color = 'white' }) => (
  <Ionicons name="pause" size={typeof width === 'number' ? width : 24} color={color} />
);

export const IconRestart: React.FC<IconProps> = ({ width = 24, height = 24, color = 'white' }) => (
  <Ionicons name="refresh" size={typeof width === 'number' ? width : 24} color={color} />
);

export const IconRewind: React.FC<IconProps> = ({ width = 24, height = 24, color = 'white' }) => (
  <Ionicons name="play-back" size={typeof width === 'number' ? width : 24} color={color} />
);

export const IconFastForward: React.FC<IconProps> = ({ width = 24, height = 24, color = 'white' }) => (
  <Ionicons name="play-forward" size={typeof width === 'number' ? width : 24} color={color} />
);

export const IconFullScreen: React.FC<IconProps> = ({ width = 24, height = 24, color = 'white' }) => (
  <Ionicons name="expand" size={typeof width === 'number' ? width : 24} color={color} />
);
