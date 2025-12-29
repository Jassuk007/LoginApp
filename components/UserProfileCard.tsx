import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface UserCardProps {
  userInfo: any;
  onEditPress: () => void;
}

export default function UserProfileCard({ userInfo, onEditPress }: UserCardProps) {
  return (
    <View style={styles.profileCard}>
      {/* 1. Profile Picture */}
      <Image source={{ uri: userInfo.picture }} style={styles.profileImage} />
      
      {/* 2. Name */}
      <Text style={styles.userName}>{userInfo.name}</Text>

      {/* 3. 👉 NEW: Email ID (Name ke neeche) */}
      <Text style={styles.userEmail}>{userInfo.email}</Text>

      {/* 4. Location */}
      <Text style={styles.userLocation}>{userInfo.address || "No Location Set"}</Text>
      
      {/* 5. DOB Info */}
      <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🎂 DOB:</Text>
          <Text style={styles.infoValue}>{userInfo.dob || "--/--/----"}</Text>
      </View>
      
      {/* 6. Edit Button */}
      <TouchableOpacity style={styles.editProfileBtn} onPress={onEditPress}>
        <Text style={{color: '#fff', fontWeight: 'bold'}}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: { 
    width: '100%', 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 20, 
    alignItems: 'center', 
    elevation: 5, 
    marginBottom: 20 
  },
  profileImage: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    marginBottom: 10,
    borderWidth: 2,    // Thoda border diya hai taaki photo ubhar ke aaye
    borderColor: '#eee'
  },
  userName: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#333',
    textAlign: 'center'
  },
  // 👉 NEW STYLE FOR EMAIL
  userEmail: {
    fontSize: 14,
    color: '#666',      // Dark Grey color
    marginBottom: 5,    // Thoda gap Location se
    marginTop: 2,       // Thoda gap Name se
    fontWeight: '500'
  },
  userLocation: { 
    fontSize: 16, 
    color: '#777', 
    marginBottom: 15,
    fontStyle: 'italic' // Thoda stylish look
  },
  infoRow: { 
    flexDirection: 'row', 
    marginBottom: 15,
    backgroundColor: '#f9f9f9', // Halka background highlight ke liye
    padding: 8,
    borderRadius: 8
  },
  infoLabel: { fontWeight: 'bold', marginRight: 5, color: '#444' },
  infoValue: { color: '#555' },
  editProfileBtn: { 
    backgroundColor: '#3498db', 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 20 
  },
});