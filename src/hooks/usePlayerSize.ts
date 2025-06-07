import { useMemo } from 'react';
import { useOrientation } from './useOrientation';
import { Dimensions } from 'react-native';

export const usePlayerSize = () => {
  const isLandscape = useOrientation();
  
  const playerSize = useMemo(() => {
    if (isLandscape) {
      return {
        width: '100%',
        height: Dimensions.get('screen').width * 0.65 / (16 / 9)
      };
    } else {
      return {
        width: '100%',
        height: Dimensions.get('screen').width / (16 / 9)
      };
    }
  }, [isLandscape]);

  return playerSize;
};
