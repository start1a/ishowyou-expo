import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { isLandscapeMode } from '@/src/utils/videoUtils';

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
