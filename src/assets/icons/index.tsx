import React from 'react';
import { SvgProps } from 'react-native-svg';
import { sizes } from '@/src/theme';

// SVG 아이콘 import - 비디오 플레이어
import IconPlaySvg from './svg/icon-play.svg';
import IconPauseSvg from './svg/icon-pause.svg';
import IconRewindSvg from './svg/icon-rewind.svg';
import IconFastForwardSvg from './svg/icon-fast-forward.svg';
import IconFullScreenSvg from './svg/icon-fullscreen.svg';
import IconRefreshSvg from './svg/icon-refresh.svg';

// SVG 아이콘 import - 네비게이션 & UI
import IconBackSvg from './svg/icon-back.svg';
import IconHomeSvg from './svg/icon-home.svg';
import IconSettingsSvg from './svg/icon-settings.svg';
import IconLogoutSvg from './svg/icon-logout.svg';
import IconExitRoomSvg from './svg/icon-exit-room.svg';

// SVG 아이콘 import - 채팅 & 비디오
import IconChatSvg from './svg/icon-chat.svg';
import IconSendSvg from './svg/icon-send.svg';
import IconVideoListSvg from './svg/icon-video-list.svg';
import IconUserSvg from './svg/icon-user.svg';
import IconDoneSvg from './svg/icon-done.svg';
import IconSearchSvg from './svg/icon-search.svg';
import IconAddSvg from './svg/icon-add.svg';
import IconWarningSvg from './svg/icon-warning.svg';

interface IconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
}

// 비디오 플레이어 아이콘
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

// 네비게이션 아이콘
export const IconBack = ({ width = sizes.iconMd, height = sizes.iconMd, color = 'white', ...props }: IconProps) => (
  <IconBackSvg width={width} height={height} stroke={color} {...props} />
);

export const IconHome = ({ width = sizes.iconMd, height = sizes.iconMd, color = 'white', ...props }: IconProps) => (
  <IconHomeSvg width={width} height={height} stroke={color} fill={color} {...props} />
);

export const IconSettings = ({ width = sizes.iconMd, height = sizes.iconMd, color = 'white', ...props }: IconProps) => (
  <IconSettingsSvg width={width} height={height} stroke={color} {...props} />
);

export const IconLogout = ({ width = sizes.iconMd, height = sizes.iconMd, color = 'white', ...props }: IconProps) => (
  <IconLogoutSvg width={width} height={height} stroke={color} {...props} />
);

export const IconExitRoom = ({ width = sizes.iconMd, height = sizes.iconMd, color = 'white', ...props }: IconProps) => (
  <IconExitRoomSvg width={width} height={height} stroke={color} fill={color} {...props} />
);

// 채팅 & 비디오 아이콘
export const IconChat = ({ width = sizes.iconMd, height = sizes.iconMd, color = 'white', ...props }: IconProps) => (
  <IconChatSvg width={width} height={height} stroke={color} {...props} />
);

export const IconSend = ({ width = sizes.iconMd, height = sizes.iconMd, color = 'white', ...props }: IconProps) => (
  <IconSendSvg width={width} height={height} fill={color} stroke={color} {...props} />
);

export const IconVideoList = ({ width = sizes.iconMd, height = sizes.iconMd, color = 'white', ...props }: IconProps) => (
  <IconVideoListSvg width={width} height={height} stroke={color} fill={color} {...props} />
);

export const IconUser = ({ width = sizes.iconMd, height = sizes.iconMd, color = 'white', ...props }: IconProps) => (
  <IconUserSvg width={width} height={height} fill={color} {...props} />
);

export const IconDone = ({ width = sizes.iconMd, height = sizes.iconMd, color = 'white', ...props }: IconProps) => (
  <IconDoneSvg width={width} height={height} stroke={color} {...props} />
);

export const IconSearch = ({ width = sizes.iconMd, height = sizes.iconMd, color = 'white', ...props }: IconProps) => (
  <IconSearchSvg width={width} height={height} stroke={color} {...props} />
);

export const IconAdd = ({ width = sizes.iconMd, height = sizes.iconMd, color = 'white', ...props }: IconProps) => (
  <IconAddSvg width={width} height={height} stroke={color} {...props} />
);

export const IconWarning = ({ width = sizes.iconMd, height = sizes.iconMd, color = 'white', ...props }: IconProps) => (
  <IconWarningSvg width={width} height={height} fill={color} {...props} />
);
