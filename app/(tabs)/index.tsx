import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, SafeAreaView, StatusBar, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import YoutubePlayer, { PLAYER_STATES, YoutubeIframeRef } from "react-native-youtube-iframe";
import { scaleHeight, scaleWidth } from "../../src/DeviceScale";
import { 
  IconFastForward, 
  IconFullScreen, 
  IconPause, 
  IconPlay, 
  IconRestart, 
  IconRewind 
} from "../../src/assets/icons";
import { LandscapeProgressBar, PortraitProgressBar } from "../../src/components/ProgressBar";

// 시간 포맷 함수 - HH:MM:SS 또는 MM:SS 형식으로 변환
const formatTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export default function TabOneScreen() {
  const playerRef = useRef<YoutubeIframeRef>(null);
  // 비디오
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [playingState, setPlayingState] = useState<PLAYER_STATES>(PLAYER_STATES.UNSTARTED);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const timeUpdateInterval = useRef<any>(null);

  // 플레이어
  const [isLandscape, setIsLandscape] = useState(isLandscapeMode());
  const [playerSize, setPlayerSize] = useState(calculatePlayerSize(isLandscape));
  const [isControllerVisible, setIsControllerVisible] = useState(true);
  const [videoId] = useState("iJsWRpSetq0"); // Example video ID - you can change this
  const insets = useSafeAreaInsets();

  const WIDTH_ICON_PLAY = isLandscape ? '70%' : '50%';
  const WIDTH_SMALL_ICON = scaleHeight(20);
  const WIDTH_PLAY_HEAD = scaleWidth(15);

  const onStateChange = useCallback((state: PLAYER_STATES) => {
    console.log(state);
    setPlayingState(state);
    if (state === PLAYER_STATES.ENDED) {
      setIsEnded(true);
      setIsPlaying(false);
    }
  }, []);

  const handlePlayToggle = useCallback(() => {
    if (isEnded) {
      // 재생이 끝난 상태에서는 처음부터 다시 재생
      playerRef.current?.seekTo(0, true);
      setIsPlaying(true);
      setIsEnded(false);
    } else {
      setIsPlaying(prev => !prev);
    }
  }, [isEnded]);

  // 오리엔테이션 변경 시 UI 조절
  useEffect(() => {
    const listener = Dimensions.addEventListener('change', ({ window: { width, height } }) => {
      const landscape = width > height;
      setIsLandscape(landscape);
      setPlayerSize(calculatePlayerSize(landscape));
    });
    return () => {
      listener.remove();
    }
  }, []);

  useEffect(() => {
    console.log('duration:', duration);
  }, [duration])

  // 비디오 시간 정보 주기적 업데이트
  useEffect(() => {
    const getVideoDetails = async () => {
      try {
        const videoDuration = await playerRef.current?.getDuration();
        if (videoDuration) {
          console.log(`videoDuration: ${videoDuration}`);
          setDuration(videoDuration);
        }
      } catch (error) {
        console.log('Error getting video duration:', error);
      }
    };

    if (playingState === PLAYER_STATES.PLAYING) {
      getVideoDetails();

      // 재생 중일 때만 현재 시간 업데이트
      timeUpdateInterval.current = setInterval(async () => {
        if (!isSeeking) {
          try {
            const time = await playerRef.current?.getCurrentTime();
            if (time !== undefined) {
              setCurrentTime(time);
            }
          } catch (error) {
            console.log('Error getting current time:', error);
          }
        }
      }, 100);
    } else {
      clearInterval(timeUpdateInterval.current);
    }

    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
    };
  }, [playingState, isSeeking]);

  const seekTo = async (to: number) => {
    const currentTime = await playerRef.current?.getCurrentTime();
    if (!currentTime) return;
    if (currentTime >= duration - 1) return;
    console.log(`currentTime: ${JSON.stringify(currentTime, null, 2)}`);

    const newTime = currentTime + to;
    console.log(`newTime: ${newTime}`);
    console.log('duration', duration);
    playerRef.current?.seekTo(newTime > duration ? Math.trunc(duration - 1) : newTime, true);
  }

  const renderPlayingIcon = () => {
    switch (playingState) {
      case PLAYER_STATES.PLAYING:
        return (
          <IconPause
            width={WIDTH_ICON_PLAY}
            height={WIDTH_ICON_PLAY}
          />
        );
      case PLAYER_STATES.UNSTARTED: case PLAYER_STATES.PAUSED:
        return (
          <IconPlay
            width={WIDTH_ICON_PLAY}
            height={WIDTH_ICON_PLAY}
          />
        )
      case PLAYER_STATES.ENDED:
        return (
          <IconRestart
            width={WIDTH_ICON_PLAY}
            height={WIDTH_ICON_PLAY}
          />
        );
      case PLAYER_STATES.BUFFERING:
        return (
          <ActivityIndicator size="large" color="white" />
        )
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar backgroundColor="#000000" barStyle="light-content" />
      {!isLandscape && <View style={{ height: insets.top, backgroundColor: 'black' }} />}
      {isLandscape && <View style={{ width: insets.left, position: 'absolute', top: 0, bottom: 0, left: 0, backgroundColor: 'black' }} />}
      <SafeAreaView style={{
        flex: 1,
        flexDirection: isLandscape ? 'row' : 'column',
        justifyContent: 'center',
      }}>
        <View style={[
          isLandscape && {
            justifyContent: 'center',
            flex: 65,
            maxWidth: '65%'
          },
          { backgroundColor: 'black' }
        ]}>
          <YoutubePlayer
            webViewStyle={isLandscape && { width: '100%', alignSelf: 'center' }}
            initialPlayerParams={{
              controls: false,
              showClosedCaptions: false,
              preventFullScreen: true,
              rel: false,
              iv_load_policy: 3
            }}
            ref={playerRef}
            height={playerSize.height}
            play={isPlaying}
            videoId={videoId}
            onChangeState={onStateChange}
          />
          <TouchableOpacity
            style={[
              { position: 'absolute', width: '100%', height: '100%' },
              isControllerVisible && { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
            ]}
            activeOpacity={1}
            onPress={() => setIsControllerVisible((prev) => !prev)}>
            {isControllerVisible && (<>
              <View style={{ flex: 1 }}>

              </View>
              <View style={{ flex: 4, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
                <TouchableOpacity
                  style={{ justifyContent: 'center', alignItems: 'center', width: scaleHeight(72), height: scaleHeight(72) }}
                  onPress={() => seekTo(-10)}>
                  <IconRewind
                    width={WIDTH_ICON_PLAY}
                    height={WIDTH_ICON_PLAY}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ justifyContent: 'center', alignItems: 'center', width: scaleHeight(72), height: scaleHeight(72) }}
                  onPress={handlePlayToggle}>
                  {renderPlayingIcon()}
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ justifyContent: 'center', alignItems: 'center', width: scaleHeight(72), height: scaleHeight(72) }}
                  onPress={() => seekTo(10)}>
                  <IconFastForward
                    width={WIDTH_ICON_PLAY}
                    height={WIDTH_ICON_PLAY}
                  />
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1, flexDirection: 'column-reverse', justifyContent: 'flex-end', paddingStart: scaleWidth(16) }}>
                {isLandscape && (
                  <LandscapeProgressBar
                    currentTime={currentTime}
                    duration={duration}
                    playHeadWidth={WIDTH_PLAY_HEAD}
                  />
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  {/* 시간 */}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: 'white', fontSize: scaleHeight(10) }}>{formatTime(currentTime)}</Text>
                    <Text style={{ color: 'lightgray', fontSize: scaleHeight(10) }}>{`/ ${formatTime(duration)}`}</Text>
                  </View>

                  {/* 전체화면 버튼 */}
                  <TouchableOpacity
                    style={{ paddingEnd: scaleHeight(16), marginStart: scaleWidth(12) }}
                    onPress={async () => {
                      try {
                        const currentOrientation = await ScreenOrientation.getOrientationAsync();
                        
                        if (currentOrientation === ScreenOrientation.Orientation.PORTRAIT_UP) {
                          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
                        } else {
                          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
                        }
                      } catch (error) {
                        console.log('Orientation change error:', error);
                      }
                    }}>
                    <IconFullScreen
                      width={WIDTH_SMALL_ICON}
                      height={WIDTH_SMALL_ICON}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </>)}
          </TouchableOpacity>
        </View>

        <View style={{
          flex: 35,
          backgroundColor: 'white',
          width: isLandscape ? '35%' : '100%',
        }}>
          <Text style={{ textAlign: 'center', marginTop: 10 }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>
        </View>

        {!isLandscape && (
          <PortraitProgressBar
            currentTime={currentTime}
            duration={duration}
            playHeadWidth={WIDTH_PLAY_HEAD}
            playerHeight={parseFloat(playerSize.height.toString())}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

// Utility functions for dimension handling
const getWindowWidth = () => Dimensions.get('screen').width;
const getWindowHeight = () => Dimensions.get('screen').height;
const isLandscapeMode = () => getWindowWidth() > getWindowHeight();
const calculatePlayerSize = (landscape: boolean) => {
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
