import React, { useState } from "react";
import { SafeAreaView, StatusBar, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scaleWidth, scaleHeight } from "@src/DeviceScale";
import { PortraitProgressBar } from "@src/components/ProgressBar";
import { VideoPlayerComponent } from "@src/components/VideoPlayer";
import { formatTime, isLandscapeMode } from "@src/utils/videoUtils";
import { VIDEO_LIST } from "@src/constants/videoData";
import { VideoList } from "@/src/components/VideoList/VideoList";


export default function TabOneScreen() {
  
  const [isLandscape, setIsLandscape] = useState(isLandscapeMode());
  const [selectedVideo, setSelectedVideo] = useState(VIDEO_LIST[0]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const insets = useSafeAreaInsets();

  const WIDTH_PLAY_HEAD = scaleWidth(15);


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
        <VideoPlayerComponent
          videoId={selectedVideo.videoId}
          isLandscape={isLandscape}
          onOrientationChange={setIsLandscape}
          onTimeUpdate={(current, total) => {
            setCurrentTime(current);
            setDuration(total);
          }}
        />

        <View style={{
          flex: 35,
          backgroundColor: 'white',
          width: isLandscape ? '35%' : '100%',
        }}>
          <Text style={{ textAlign: 'center', marginTop: scaleHeight(10), fontSize: scaleWidth(16), fontWeight: 'bold' }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>
          <VideoList
            videos={VIDEO_LIST}
            onVideoSelect={setSelectedVideo}
          />
        </View>

        {!isLandscape && (
          <PortraitProgressBar
            currentTime={currentTime}
            duration={duration}
            playHeadWidth={WIDTH_PLAY_HEAD}
            playerHeight={200} // 임시값, 실제로는 VideoPlayerComponent에서 계산된 값을 받아야 함
          />
        )}
      </SafeAreaView>
    </View>
  );
}
