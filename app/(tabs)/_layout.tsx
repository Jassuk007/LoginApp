// import React from 'react';
// import { Tabs } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { Platform } from 'react-native';

// export default function TabLayout() {
//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false, // Upar wala header chupane ke liye
//         tabBarStyle: Platform.select({
//           ios: {
//             position: 'absolute', // iOS par translucent effect ke liye
//           },
//           default: {},
//         }),
//       }}>
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: 'Home',
//           tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
//         }}
//       />
//       {/* Agar future mein aur tabs add karne ho (jaise Settings), toh yahan add kar sakte ho */}
//     </Tabs>
//   );
// }




import { Ionicons } from '@expo/vector-icons'; // Icons ke liye
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Upar wala header hata diya
        tabBarActiveTintColor: '#2f95dc', // Active color (Blue)
        tabBarStyle: { paddingBottom: 5, height: 60 },
      }}>
      
      {/* 1. Home Tab (Tasks) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} />,
        }}
      />

      {/* 2. Profile Tab (New) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />

      {/* 3. 👉 NEW Chat Tab */}
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