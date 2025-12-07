import React from 'react';
import { Tabs } from 'expo-router';

import { useOrientationContext } from '@src/contexts/OrientationContext';
import { IconHome, IconSettings } from '@src/assets/icons';
import { colors, spacing } from '@src/theme';

const TabLayout = () => {
  const { isLandscape } = useOrientationContext();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
        tabBarStyle: isLandscape
          ? { display: 'none' }
          : {
              backgroundColor: colors.backgroundCard,
              borderTopColor: colors.border,
              borderTopWidth: 1,
              paddingTop: spacing.sm,
              paddingBottom: spacing.sm,
              height: 60,
            },
        tabBarItemStyle: {
          paddingVertical: spacing.xs,
        },
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
