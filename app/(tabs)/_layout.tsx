import { Tabs } from 'expo-router';
import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <ProtectedRoute>
      <Tabs
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: '#2563EB',
          tabBarStyle: {
            borderTopWidth: 0,
            elevation: 0,
            height: 60,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            headerShown: false,
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Tasks',
            headerShown: false,
            tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
          }}
        />
        <Tabs.Screen
          name="focus"
          options={{
            title: 'Focus',
            headerShown: false,
            tabBarIcon: ({ color }) => <TabBarIcon name="timer" color={color} />,
          }}
        />
      </Tabs>
    </ProtectedRoute>
  );
}

function TabBarIcon(props: {
  name: React.ComponentProps<typeof MaterialIcons>['name'];
  color: string;
}) {
  return <MaterialIcons size={28} style={{ marginBottom: -3 }} {...props} />;
}
