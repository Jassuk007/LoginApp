import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface EditFormProps {
  picture: string;
  name: string;
  dob: string;
  address: string;
  date: Date;
  showDatePicker: boolean;
  setName: (text: string) => void;
  setAddress: (text: string) => void;
  pickImage: () => void;
  setShowDatePicker: (val: boolean) => void;
  onDateChange: (event: any, date?: Date) => void;
  saveProfile: () => void;
  cancelEdit: () => void;
}

export default function EditProfileForm({
  picture, name, dob, address, date, showDatePicker,
  setName, setAddress, pickImage, setShowDatePicker, onDateChange, saveProfile, cancelEdit
}: EditFormProps) {
  
  return (
    <ScrollView contentContainerStyle={styles.editContainer}>
        {/* Profile Image Section */}
        <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 30 }}>
          <View style={styles.imageWrapper}>
            <Image source={{ uri: picture }} style={styles.editProfileImage} />
          </View>
          <TouchableOpacity style={styles.editPicBtn} onPress={pickImage}>
            <Text style={styles.editPicText}>Edit Picture</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <Text style={styles.label}>Full Name</Text>
        <View style={styles.inputBox}>
          <TextInput style={styles.textInput} value={name} onChangeText={setName} placeholder="Enter Name" />
        </View>

        <Text style={styles.label}>Date of Birth</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputBox}>
          <Text style={styles.textInput}>{dob || "Select Date"}</Text>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} />
        )}

        <Text style={styles.label}>Address</Text>
        <View style={styles.inputBox}>
          <TextInput style={styles.textInput} value={address} onChangeText={setAddress} placeholder="e.g. Lucknow, India" />
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{marginTop: 15, alignItems: 'center'}} onPress={cancelEdit}>
           <Text style={{color: '#777'}}>Cancel</Text>
        </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  editContainer: { flexGrow: 1, backgroundColor: '#F4F7FC', padding: 20 },
  imageWrapper: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#dceeff', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  editProfileImage: { width: '100%', height: '100%' },
  editPicBtn: { marginTop: -15, backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20, elevation: 2, borderWidth: 1, borderColor: '#3498db' },
  editPicText: { color: '#3498db', fontWeight: 'bold' },
  label: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8, marginTop: 15 },
  inputBox: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, borderWidth: 1, borderColor: '#e0e0e0', elevation: 1 },
  textInput: { fontSize: 16, color: '#000', fontWeight: '500' },
  saveBtn: { backgroundColor: '#3498db', paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginTop: 40, elevation: 3 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});