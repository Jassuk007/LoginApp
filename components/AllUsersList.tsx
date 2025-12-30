import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons'; // 👉 Icon import kiya

export default function AllUsersList({ onUserSelect }: { onUserSelect: (user: any) => void }) {
  const [users, setUsers] = useState([]);
  const { API_URL, user } = useAuth(); 

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/users`);
        // Khud ko list se hata do
        const otherUsers = res.data.filter((u: any) => u.email !== user.email);
        setUsers(otherUsers);
      } catch (e) { console.log(e); }
    };
    
    // Auto refresh ke liye interval (Optional, agar chaho to hata sakte ho)
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
            {/* User Image */}
            <Image 
              source={{ uri: item.picture || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }} 
              style={styles.avatar} 
            />
            
            <View style={styles.userInfo}>
              {/* Name */}
              <Text style={styles.name}>{item.name}</Text>
              
              {/* 👉 Location Logic */}
              <View style={styles.locationRow}>
                <Ionicons 
                  name={item.location ? "location-sharp" : "help-circle-outline"} 
                  size={14} 
                  color={item.location ? "#e74c3c" : "#999"} 
                />
                <Text style={[styles.locationText, !item.location && {fontStyle: 'italic'}]}>
                  {item.location ? item.location : "Location not shared"}
                </Text>
              </View>

            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#075E54' },
  
  userCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 10, 
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  
  userInfo: { flex: 1, justifyContent: 'center' },
  
  name: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  
  // New Styles for Location
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 12, color: '#666', marginLeft: 4 }
});