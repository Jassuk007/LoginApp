import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, Alert, 
  ActivityIndicator, Modal, TextInput, ScrollView, Platform 
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker'; // 👉 Calendar Library

export default function ProfileScreen() {
  const { user, logout, setUser, API_URL } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Edit States
  const [newName, setNewName] = useState("");
  const [newDob, setNewDob] = useState("");
  const [newImage, setNewImage] = useState("");

  // 👉 DATE PICKER STATES
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateObject, setDateObject] = useState(new Date());

  useEffect(() => {
    if (modalVisible) {
        setNewName(user?.name || "");
        setNewDob(user?.dob || ""); 
        setNewImage(user?.picture || "");
    }
  }, [modalVisible, user]);

  const handleGetLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      let addressResponse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (addressResponse.length > 0) {
        const addr = addressResponse[0];
        const fullAddress = `${addr.city || addr.region}, ${addr.country}`;
        const userId = user.googleId || user._id;
        const res = await axios.put(`${API_URL}/api/users/location`, { userId, location: fullAddress });
        setUser(res.data);
        Alert.alert("Success", "Location updated!");
      }
    } catch (error) { Alert.alert("Error", "Could not fetch location."); } 
    finally { setLoading(false); }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true, quality: 0.5, allowsEditing: true, aspect: [1, 1]
    });
    if (!result.canceled && result.assets) {
      setNewImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  // 👉 DATE CHANGE HANDLER
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false); // Calendar band karo
    if (selectedDate) {
      setDateObject(selectedDate);
      // Date ko "DD-MM-YYYY" format mein convert karo
      const formattedDate = selectedDate.toLocaleDateString('en-GB').replace(/\//g, '-');
      setNewDob(formattedDate);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const userId = user.googleId || user._id;
      const res = await axios.put(`${API_URL}/api/users/profile`, {
        userId,
        name: newName,
        picture: newImage,
        dob: newDob
      });
      setUser(res.data);
      setModalVisible(false);
      Alert.alert("Success", "Profile Updated!");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <View style={styles.card}>
        <Image source={{ uri: user?.picture || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} style={styles.avatar} />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color="#8e44ad" />
          <Text style={styles.infoText}>{user?.dob || "DOB not set"}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color="#e74c3c" />
          <Text style={styles.infoText}>{user?.location || "Location not set"}</Text>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.editBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.btnText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.locationBtn} onPress={handleGetLocation} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="navigate" size={20} color="#fff" />
              <Text style={styles.btnText}>Update Location</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.btnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* --- EDIT PROFILE MODAL --- */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            
            <TouchableOpacity onPress={pickImage} style={{alignItems: 'center', marginBottom: 20}}>
               <Image source={{ uri: newImage || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} style={styles.modalAvatar} />
               <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Full Name</Text>
            <TextInput 
              style={styles.input} 
              value={newName} 
              onChangeText={setNewName} 
              placeholder="Enter Name"
            />

            {/* 👉 DATE OF BIRTH FIELD (Clickable) */}
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <View style={[styles.input, { justifyContent: 'center' }]}>
                <Text style={{ color: newDob ? '#000' : '#888' }}>
                  {newDob || "Select Date"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* 👉 DATE PICKER COMPONENT (Sirf tab dikhega jab showDatePicker true ho) */}
            {showDatePicker && (
              <DateTimePicker
                value={dateObject}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()} // Future date select nahi kar payenge
              />
            )}

            <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                    <Text style={{color: '#333'}}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={{color: '#fff'}}>Save Changes</Text>}
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#075E54', padding: 20, paddingTop: 50, alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  card: { backgroundColor: '#fff', margin: 20, padding: 25, borderRadius: 15, alignItems: 'center', elevation: 5 },
  avatar: { width: 110, height: 110, borderRadius: 55, marginBottom: 15, borderWidth: 3, borderColor: '#075E54' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  email: { fontSize: 14, color: '#666', marginBottom: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: '#f9f9f9', padding: 10, borderRadius: 10, width: '100%' },
  infoText: { fontSize: 16, color: '#333', marginLeft: 10, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#eee', width: '100%', marginVertical: 15 },
  editBtn: { flexDirection: 'row', backgroundColor: '#f39c12', paddingVertical: 12, borderRadius: 25, alignItems: 'center', marginBottom: 10, width: '100%', justifyContent: 'center' },
  locationBtn: { flexDirection: 'row', backgroundColor: '#3498db', paddingVertical: 12, borderRadius: 25, alignItems: 'center', marginBottom: 10, width: '100%', justifyContent: 'center' },
  logoutBtn: { flexDirection: 'row', backgroundColor: '#e74c3c', paddingVertical: 12, borderRadius: 25, alignItems: 'center', width: '100%', justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '85%', backgroundColor: '#fff', borderRadius: 15, padding: 25, elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#075E54' },
  modalAvatar: { width: 90, height: 90, borderRadius: 45 },
  changePhotoText: { color: '#3498db', marginTop: 5, fontSize: 12, fontWeight: 'bold' },
  label: { fontSize: 12, color: '#666', marginBottom: 5, fontWeight: 'bold', alignSelf: 'flex-start' },
  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 15, backgroundColor: '#f9f9f9', height: 50 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  cancelBtn: { padding: 12, flex: 1, alignItems: 'center' },
  saveBtn: { backgroundColor: '#075E54', padding: 12, borderRadius: 8, flex: 1, alignItems: 'center', marginLeft: 10 }
});