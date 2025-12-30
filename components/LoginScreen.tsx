import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { setUser, API_URL } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");
  const [picture, setPicture] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Helper Component for Inputs (Code clean rakhne ke liye)
  const InputField = ({ label, icon, placeholder, value, onChange, secure, keyboard }: any) => (
    <View style={{marginBottom: 15}}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name={icon} size={20} color="#888" style={{marginRight: 10}} />
        <TextInput 
          style={styles.input} 
          placeholder={placeholder} 
          placeholderTextColor="#aaa"
          value={value} 
          onChangeText={onChange} 
          secureTextEntry={secure}
          keyboardType={keyboard || 'default'}
        />
      </View>
    </View>
  );

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response) && response.data.idToken) {
        const type = isLoginView ? 'LOGIN' : 'SIGNUP';
        try {
          const res = await axios.post(`${API_URL}/api/auth/google`, { token: response.data.idToken, type });
          setUser(res.data.user);
        } catch (error: any) {
          Alert.alert("Auth Error", error.response?.data?.error || "Failed");
          await GoogleSignin.signOut();
        }
      }
    } catch (e) { console.log(e); } finally { setLoading(false); }
  };

  const handleManualAuth = async () => {
    setLoading(true);
    try {
      if (isLoginView) {
        const res = await axios.post(`${API_URL}/api/login`, { email, password });
        setUser(res.data.user);
      } else {
        if(!email || !password || !name) { Alert.alert("Error", "Name, Email & Password required"); setLoading(false); return; }
        await axios.post(`${API_URL}/api/signup`, { name, email, password, phone, address, dob, picture });
        Alert.alert("Success", "Account Created! Please Login.");
        setIsLoginView(true);
      }
    } catch (error: any) { Alert.alert("Error", error.response?.data?.error || "Failed"); } finally { setLoading(false); }
  };

  const pickImage = async () => {
    const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!res.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true });
    if (!result.canceled) setPicture(`data:image/jpeg;base64,${result.assets[0].base64}`);
  };

  const onDateChange = (e: any, d?: Date) => { setShowDatePicker(false); if(d) { setDate(d); setDob(d.toISOString().split('T')[0]); }};

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={!isLoginView ? pickImage : undefined}>
            <Image 
              source={{ uri: picture || "https://cdn-icons-png.flaticon.com/512/149/149071.png" }} 
              style={styles.logo} 
            />
          </TouchableOpacity>
          {!isLoginView && <Text style={{color:'#3498db', fontSize:12}}>Tap to Add Photo</Text>}
          
          <Text style={styles.welcomeText}>{isLoginView ? "Welcome Back!" : "Create Account"}</Text>
          <Text style={styles.subText}>{isLoginView ? "Sign in to continue" : "Fill details to sign up"}</Text>
        </View>

        {/* --- FORM --- */}
        <View style={styles.formContainer}>
          {!isLoginView && <InputField label="Full Name" icon="person-outline" placeholder="e.g. Rahul Kumar" value={name} onChange={setName} />}
          
          <InputField label="Email Address" icon="mail-outline" placeholder="name@example.com" value={email} onChange={setEmail} keyboard="email-address" />
          
          <InputField label="Password" icon="lock-closed-outline" placeholder="Enter your password" value={password} onChange={setPassword} secure />
          
          {!isLoginView && (
            <>
              <InputField label="Phone Number" icon="call-outline" placeholder="e.g. 9876543210" value={phone} onChange={setPhone} keyboard="phone-pad" />
              <InputField label="Address" icon="location-outline" placeholder="e.g. Mumbai, India" value={address} onChange={setAddress} />
              
              <View style={{marginBottom: 15}}>
                <Text style={styles.label}>Date of Birth</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputWrapper}>
                  <Ionicons name="calendar-outline" size={20} color="#888" style={{marginRight: 10}} />
                  <Text style={{color: dob ? '#333' : '#aaa', fontSize: 16}}>{dob || "Select Date"}</Text>
                </TouchableOpacity>
                {showDatePicker && <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} />}
              </View>
            </>
          )}

          <TouchableOpacity style={styles.primaryBtn} onPress={handleManualAuth} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{isLoginView ? "LOG IN" : "SIGN UP"}</Text>}
          </TouchableOpacity>

          {/* Divider */}
          <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 20}}>
            <View style={{flex:1, height:1, backgroundColor:'#eee'}} />
            <Text style={{marginHorizontal:10, color:'#aaa'}}>OR</Text>
            <View style={{flex:1, height:1, backgroundColor:'#eee'}} />
          </View>

          <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleAuth}>
            <Ionicons name="logo-google" size={20} color="#DB4437" style={{marginRight: 10}} />
            <Text style={styles.googleBtnText}>{isLoginView ? "Sign in with Google" : "Sign up with Google"}</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={{color:'#666'}}>{isLoginView ? "Don't have an account?" : "Already have an account?"} </Text>
            <TouchableOpacity onPress={() => setIsLoginView(!isLoginView)}>
              <Text style={{color:'#3498db', fontWeight:'bold'}}>{isLoginView ? "Sign Up" : "Log In"}</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 25 },
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 90, height: 90, borderRadius: 45, marginBottom: 10, borderWidth:1, borderColor:'#eee' },
  welcomeText: { fontSize: 26, fontWeight: 'bold', color: '#333', marginTop: 5 },
  subText: { fontSize: 16, color: '#888', marginTop: 5 },
  
  formContainer: { width: '100%' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5, marginLeft: 2 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 15, height: 50 },
  input: { flex: 1, fontSize: 16, color: '#333' },
  
  primaryBtn: { backgroundColor: '#3498db', borderRadius: 10, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 3 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, height: 50 },
  googleBtnText: { fontSize: 16, fontWeight: '600', color: '#333' },
  
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
});