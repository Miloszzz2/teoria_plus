import React from 'react';
import { Link, Tabs, useRouter } from 'expo-router';
import i18n from '../i18n';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useTheme } from '@react-navigation/native';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome6>['name'];
  color: string;
}) {
  return <FontAwesome6 size={20} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.card,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ color }) => <TabBarIcon name="graduation-cap" color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "",
          tabBarIcon: ({ color }) => <TabBarIcon name="chart-line" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <Ionicons name="settings-sharp" size={22} style={{ marginBottom: -3 }} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(modes)/exam-mode"
        options={{
          title: i18n.t('select_category'),
          href: null,

        }}
      />
      <Tabs.Screen
        name="(modes)/learning-mode"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
