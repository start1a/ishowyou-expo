import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

const getWindowWidth = () => Dimensions.get('screen').width;
const getWindowHeight = () => Dimensions.get('screen').height;
const isLandscapeMode = () => getWindowWidth() > getWindowHeight();

export const useOrientation = () => {
  const [isLandscape, setIsLandscape] = useState(isLandscapeMode());

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setIsLandscape(isLandscapeMode());
    });

    return () => subscription?.remove();
  }, []);

  return isLandscape;
};