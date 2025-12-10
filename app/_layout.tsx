import FontAwesome from '@expo/vector-icons/FontAwesome';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
  // Layout 컴포넌트에서 발생하는 모든 에러를 캐치합니다.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // `/modal`에서 새로고침 시 뒤로가기 버튼이 유지되도록 합니다.
  initialRouteName: '(tabs)',
};

// 자산 로딩이 완료되기 전에 스플래시 화면이 자동으로 숨겨지지 않도록 합니다.
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router는 Error Boundary를 사용하여 네비게이션 트리의 에러를 캐치합니다.
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
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
  );
};

export default RootLayout;