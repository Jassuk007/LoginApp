import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function AllUsersList({ onUserSelect }: { onUserSelect: (user: any) => void }) {
  const [users, setUsers] = useState([]);
  const { API_URL, user } = useAuth(); // Apna khud ka user ID chahiye taaki list mein khud na dikhein

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/users`);
        // Apne aap ko list se filter kar do
        const otherUsers = res.data.filter((u: any) => u.email !== user.email);
        setUsers(otherUsers);
      } catch (e) { console.log(e); }
    };
    fetchUsers();
  }, [API_URL, user.email]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start a Conversation</Text>
      <FlatList
        data={users}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userCard} onPress={() => onUserSelect(item)}>
            <Image source={{ uri: item.picture || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }} style={styles.avatar} />
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.email}>{item.email}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  name: { fontSize: 16, fontWeight: 'bold' },
  email: { fontSize: 12, color: '#666' }
});