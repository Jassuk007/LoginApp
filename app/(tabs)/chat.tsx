import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AllUsersList from '../../components/AllUsersList';
import ChatScreen from '../../components/ChatScreen';

// 👇👇 DEKHO YAHAN LIKHA HAI "export default" 👇👇
export default function ChatTab() {
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Agar user select kiya hai to ChatScreen dikhao
  if (selectedUser) {
    return <ChatScreen chatWithUser={selectedUser} onBack={() => setSelectedUser(null)} />;
  }

  // Nahi to Users List dikhao
  return (
    <View style={styles.container}>
      <AllUsersList onUserSelect={(user) => setSelectedUser(user)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FC', paddingTop: 40 },
});