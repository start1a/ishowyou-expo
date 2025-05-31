import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { scaleHeight, scaleWidth } from '../DeviceScale';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  playHeadWidth: number;
  playerHeight?: number;
  style?: any;
}

export const PortraitProgressBar: React.FC<ProgressBarProps> = ({ 
  currentTime, 
  duration, 
  playHeadWidth, 
  playerHeight = 0,
  style 
}) => {
  const progress = duration > 0 ? currentTime / duration : 0;
  const screenWidth = Dimensions.get('window').width;
  
  return (
    <View style={[styles.portraitContainer, { top: playerHeight - scaleHeight(4) }, style]}>
      <View style={[styles.progressTrack, { width: screenWidth }]}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${progress * 100}%`,
            }
          ]} 
        />
        <View 
          style={[
            styles.playHead, 
            { 
              width: playHeadWidth, 
              height: playHeadWidth,
              left: (screenWidth * progress) - (playHeadWidth / 2)
            }
          ]} 
        />
      </View>
    </View>
  );
};

export const LandscapeProgressBar: React.FC<ProgressBarProps> = ({ 
  currentTime, 
  duration, 
  playHeadWidth 
}) => {
  const progress = duration > 0 ? currentTime / duration : 0;
  
  return (
    <View style={styles.landscapeContainer}>
      <View style={styles.progressTrack}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${progress * 100}%`,
            }
          ]} 
        />
        <View 
          style={[
            styles.playHead, 
            { 
              width: playHeadWidth, 
              height: playHeadWidth,
              right: -playHeadWidth / 2
            }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  portraitContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 0,
  },
  landscapeContainer: {
    paddingHorizontal: scaleWidth(16),
    marginBottom: scaleHeight(8),
  },
  progressTrack: {
    height: scaleHeight(4),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: scaleHeight(2),
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF0000',
    borderRadius: scaleHeight(2),
    position: 'relative',
  },
  playHead: {
    backgroundColor: '#FF0000',
    borderRadius: 50,
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -scaleHeight(6) }],
  },
});
