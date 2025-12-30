import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // System Header Off
        
        // 👉 MAGIC FIX: Keyboard aate hi Tabs gayab ho jayenge
        tabBarHideOnKeyboard: true, 
        
        tabBarActiveTintColor: '#075E54', // WhatsApp Green
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { 
          paddingBottom: 5, 
          height: 60,
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 5,
          // Android par kabhi kabhi height issue hota hai, ye fix karega
          display: 'flex'
        },
      }}>
      
      {/* 1. Home Tab (Tasks) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} />,
        }}
      />

      {/* 2. Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />

      {/* 3. Chat Tab */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}