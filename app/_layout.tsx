import { Stack } from 'expo-router';
import React from 'react';
import { StatusBar, View } from 'react-native'; // 👉 StatusBar Import kiya
import LoginScreen from '../components/LoginScreen';
import { AuthProvider, useAuth } from '../context/AuthContext';

function RootLayoutNav() {
  const { user, isLoading } = useAuth();

  // Agar load ho raha hai to blank screen dikhao
  if (isLoading) return <View style={{ flex: 1, backgroundColor: '#fff' }} />;

  // 👉 MAIN LOGIC:
  // Agar user nahi hai -> Login Screen dikhao
  if (!user) {
    return <LoginScreen />;
  }

  // Agar user hai -> Tabs dikhao
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

// App ko Provider mein wrap kiya
export default function Layout() {
  return (
    <AuthProvider>
      {/* 
          👉 GLOBAL STATUS BAR CONFIGURATION 
          Isse Status bar transparent rahega aur icons dark/light adjust honge.
      */}
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      
      <RootLayoutNav />
    </AuthProvider>
  );
}