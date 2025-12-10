import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@src/contexts/AuthContext';
import { useShare } from '@src/contexts/ShareContext';
import { LoginForm } from '@src/components/Auth/LoginForm';

const AuthNavigator = () => {
  const { user, loading } = useAuth();
  const { sharedVideo } = useShare();
  const router = useRouter();

  // 공유된 비디오가 있고 로그인된 상태면 방 선택 화면으로 이동
  useEffect(() => {
    if (user && sharedVideo && !loading) {
      router.push('/share-video');
    }
  }, [user, sharedVideo, loading]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loginContainer}>
        <LoginForm />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="room/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="share-video" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loginContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
});

export default AuthNavigator;
