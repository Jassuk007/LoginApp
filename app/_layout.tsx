// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import 'react-native-reanimated';

// import { useColorScheme } from '@/hooks/use-color-scheme';

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

// export default function RootLayout() {
//   const colorScheme = useColorScheme();

//   return (
//     <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//       <Stack>
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//         <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
//       </Stack>
//       <StatusBar style="auto" />
//     </ThemeProvider>
//   );
// }






import { Stack } from 'expo-router';
import React from 'react';
import LoginScreen from '../components/LoginScreen';
import { AuthProvider, useAuth } from '../context/AuthContext';

function RootLayoutNav() {
  const { user, isLoading } = useAuth();

  // Agar load ho raha hai to wait karo
  if (isLoading) return null;

  // 👉 MAIN LOGIC:
  // Agar user nahi hai -> Login Screen dikhao (No Tabs)
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
      <RootLayoutNav />
    </AuthProvider>
  );
}