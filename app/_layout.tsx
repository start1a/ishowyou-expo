import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import 'react-native-reanimated';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { useColorScheme } from '@/components/useColorScheme';
import { OrientationProvider } from '@src/contexts/OrientationContext';
import { AuthProvider } from '@src/contexts/AuthContext';
import { ShareProvider } from '@src/contexts/ShareContext';
import AuthNavigator from '@src/components/Auth/AuthNavigator';
import { colors } from '@/src/theme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

const RootLayoutNav = () => {
  const colorScheme = useColorScheme();

  return (
    <KeyboardProvider>
      <AuthProvider>
        <ShareProvider>
          <OrientationProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <StatusBar backgroundColor={colors.backgroundDark} barStyle="light-content" />

              <AuthNavigator />
            </ThemeProvider>
          </OrientationProvider>
        </ShareProvider>
      </AuthProvider>
    </KeyboardProvider>
  );
};

export default RootLayout;