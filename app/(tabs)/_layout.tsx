import React from 'react';
import { Tabs } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useOrientationContext } from '@src/contexts/OrientationContext';
import { IconHome, IconSettings } from '@src/assets/icons';

const TabLayout = () => {
  const colorScheme = useColorScheme();
  const { isLandscape } = useOrientationContext();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Hide header completely
        headerShown: false,
        tabBarStyle: isLandscape ? { display: 'none' } : undefined,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => <IconHome width={24} height={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color }) => <IconSettings width={24} height={24} color={color} />,
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
