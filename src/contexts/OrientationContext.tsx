import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Dimensions } from 'react-native';

interface OrientationContextType {
  isLandscape: boolean;
  windowWidth: number;
  windowHeight: number;
}

const OrientationContext = createContext<OrientationContextType | undefined>(undefined);

interface OrientationProviderProps {
  children: ReactNode;
}

export const OrientationProvider = ({ children }: OrientationProviderProps) => {
  const getWindowDimensions = () => {
    const { width, height } = Dimensions.get('screen');
    return {
      width,
      height,
      isLandscape: width > height
    };
  };

  const [dimensions, setDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setDimensions(getWindowDimensions());
    });

    return () => subscription?.remove();
  }, []);

  return (
    <OrientationContext.Provider 
      value={{
        isLandscape: dimensions.isLandscape,
        windowWidth: dimensions.width,
        windowHeight: dimensions.height
      }}
    >
      {children}
    </OrientationContext.Provider>
  );
};

export const useOrientationContext = () => {
  const context = useContext(OrientationContext);
  if (context === undefined) {
    throw new Error('useOrientationContext must be used within an OrientationProvider');
  }
  return context;
};
