// import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
// import axios from 'axios';
// import * as ImagePicker from 'expo-image-picker';
// import React, { useEffect, useState } from 'react';
// import { ActivityIndicator, Alert, Button, ScrollView, StyleSheet, Text, View } from 'react-native';

// // Components
// import EditProfileForm from '../../components/EditProfileForm';
// import UserProfileCard from '../../components/UserProfileCard';

// export default function ProfileScreen() {
//   const [userInfo, setUserInfo] = useState<any>(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [loading, setLoading] = useState(true);

//   // Profile Form States
//   const [name, setName] = useState("");
//   const [dob, setDob] = useState("");
//   const [address, setAddress] = useState("");
//   const [picture, setPicture] = useState("");
  
//   // Date Picker
//   const [date, setDate] = useState(new Date());
//   const [showDatePicker, setShowDatePicker] = useState(false);

//   // ⚠️ UPDATE NGROK URL
//   const API_URL = 'https://hisako-exclamatory-galilea.ngrok-free.dev'; 

//   useEffect(() => {
//     GoogleSignin.configure({
//       webClientId: "354250370440-25112dslrmd811iktak7fk334csqqje7.apps.googleusercontent.com", 
//       offlineAccess: true,
//     });
//     checkLogin();
//   }, []);

//   const checkLogin = async () => {
//     try {
//       const isSignedIn = await GoogleSignin.isSignedIn();
//       if (isSignedIn) {
//         const currentUser = await GoogleSignin.getCurrentUser();
//         if(currentUser?.idToken) handleBackendAuth(currentUser.idToken);
//       } else {
//         setLoading(false);
//       }
//     } catch (error) { setLoading(false); }
//   };

//   const signInWithGoogle = async () => {
//     try {
//       await GoogleSignin.hasPlayServices();
//       const response = await GoogleSignin.signIn();
//       if (isSuccessResponse(response) && response.data.idToken) {
//         handleBackendAuth(response.data.idToken);
//       }
//     } catch (error) { console.log("Sign In Error:", error); }
//   };

//   const handleBackendAuth = async (token: string) => {
//     try {
//       const res = await axios.post(`${API_URL}/api/auth`, { token, provider: 'google' });
//       const user = res.data.user;
//       setUserInfo(user);
      
//       // Init Form Data
//       setName(user.name || "");
//       setDob(user.dob || "");
//       setAddress(user.address || "");
//       setPicture(user.picture || "");
//     } catch (error) { Alert.alert("Error", "Connection Failed"); } 
//     finally { setLoading(false); }
//   };

//   const handleLogout = async () => {
//     await GoogleSignin.signOut();
//     setUserInfo(null);
//   };

//   // Profile Logic
//   const pickImage = async () => {
//     const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!res.granted) { Alert.alert("Permission Required!"); return; }
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true,
//     });
//     if (!result.canceled) setPicture(`data:image/jpeg;base64,${result.assets[0].base64}`);
//   };

//   const onDateChange = (event: any, selectedDate?: Date) => {
//     setShowDatePicker(false);
//     if (selectedDate) { setDate(selectedDate); setDob(selectedDate.toISOString().split('T')[0]); }
//   };

//   const saveProfile = async () => {
//     try {
//       const res = await axios.put(`${API_URL}/api/users/${userInfo.email}`, { name, dob, address, picture });
//       setUserInfo(res.data);
//       setIsEditing(false);
//       Alert.alert("Success", "Profile Updated!");
//     } catch (error) { Alert.alert("Error", "Update Failed"); }
//   };

//   if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

//   // 1. LOGIN BUTTON (Agar user logged out hai)
//   if (!userInfo) {
//     return (
//       <View style={styles.center}>
//         <Text style={{fontSize: 20, marginBottom: 20}}>Welcome User</Text>
//         <Button title="Sign in with Google" onPress={signInWithGoogle} />
//       </View>
//     );
//   }

//   // 2. EDIT MODE
//   if (isEditing) {
//     return (
//       <EditProfileForm 
//         picture={picture || userInfo.picture} name={name} dob={dob} address={address} date={date} showDatePicker={showDatePicker}
//         setName={setName} setAddress={setAddress} pickImage={pickImage} setShowDatePicker={setShowDatePicker} onDateChange={onDateChange}
//         saveProfile={saveProfile} cancelEdit={() => setIsEditing(false)}
//       />
//     );
//   }

//   // 3. PROFILE VIEW
//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <UserProfileCard userInfo={userInfo} onEditPress={() => setIsEditing(true)} />
      
//       <View style={{ marginTop: 20, width: '100%' }}>
//          <Button title="Logout" onPress={handleLogout} color="#c0392b" />
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, paddingTop: 50, backgroundColor: '#F4F7FC', minHeight: '100%' },
//   center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
// });








import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, View } from 'react-native';
import EditProfileForm from '../../components/EditProfileForm';
import UserProfileCard from '../../components/UserProfileCard';
import { useAuth } from '../../context/AuthContext'; // Context use karo

export default function ProfileScreen() {
  const { user, setUser, logout, API_URL } = useAuth(); // Logout function yahan se mila
  const [isEditing, setIsEditing] = useState(false);
  
  // States (Init with user data)
  const [name, setName] = useState(user?.name || "");
  const [dob, setDob] = useState(user?.dob || "");
  const [address, setAddress] = useState(user?.address || "");
  const [picture, setPicture] = useState(user?.picture || "");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const pickImage = async () => {
    const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!res.granted) { Alert.alert("Permission Required!"); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true,
    });
    if (!result.canceled) setPicture(`data:image/jpeg;base64,${result.assets[0].base64}`);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) { setDate(selectedDate); setDob(selectedDate.toISOString().split('T')[0]); }
  };

  const saveProfile = async () => {
    try {
      const res = await axios.put(`${API_URL}/api/users/${user.email}`, { name, dob, address, picture });
      setUser(res.data); // Context update karo
      setIsEditing(false);
      Alert.alert("Success", "Profile Updated!");
    } catch (error) { Alert.alert("Error", "Update Failed"); }
  };

  if (isEditing) {
    return (
      <EditProfileForm 
        picture={picture} name={name} dob={dob} address={address} date={date} showDatePicker={showDatePicker}
        setName={setName} setAddress={setAddress} pickImage={pickImage} setShowDatePicker={setShowDatePicker} onDateChange={onDateChange}
        saveProfile={saveProfile} cancelEdit={() => setIsEditing(false)}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <UserProfileCard userInfo={user} onEditPress={() => setIsEditing(true)} />
      <View style={{ marginTop: 20, width: '100%' }}>
         {/* Logout Button: Ab ye seedha Context wala logout call karega */}
         <Button title="Logout" onPress={logout} color="#c0392b" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 50, backgroundColor: '#F4F7FC', minHeight: '100%' },
});