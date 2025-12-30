import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text, TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  StatusBar
} from 'react-native';

import { io } from 'socket.io-client';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';

export default function ChatScreen({ chatWithUser, onBack }: any) {
  const { user, API_URL } = useAuth();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [replyingTo, setReplyingTo] = useState<any>(null);
  
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fullImageVisible, setFullImageVisible] = useState(false);
  const [viewImageUri, setViewImageUri] = useState("");

  const socketRef = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);

  const getRoomId = (id1: string, id2: string) => [id1, id2].sort().join('_');
  const roomId = getRoomId(user._id || user.googleId, chatWithUser._id);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/messages/${roomId}`);
      setMessages(res.data.reverse());
    } catch (e) { console.log(e); }
  }, [API_URL, roomId]);

  useEffect(() => {
    socketRef.current = io(API_URL);
    socketRef.current.emit('join_room', roomId);
    fetchHistory();

    socketRef.current.on('receive_message', (msg: any) => {
      setMessages((prev) => {
        const exists = prev.find(m => m._id === msg._id || (m.createdAt === msg.createdAt && m.text === msg.text));
        if (exists) return prev; 
        return [msg, ...prev];
      });
    });

    socketRef.current.on('message_deleted', (deletedId: string) => {
      setMessages((prev) => prev.filter(m => m._id !== deletedId));
    });

    socketRef.current.on('message_reaction', (data: any) => {
        setMessages(prev => prev.map(msg => 
            msg._id === data.messageId ? { ...msg, reaction: data.emoji } : msg
        ));
    });

    return () => { socketRef.current.disconnect(); };
  }, [API_URL, roomId, fetchHistory]);

  const sendMessage = async (imageUrl: string | null = null) => {
    if (!inputText.trim() && !imageUrl) return;

    const tempId = Math.random().toString(); 
    const msgData = { 
      roomId, 
      senderId: user._id || user.googleId, 
      text: imageUrl ? "" : inputText,
      image: imageUrl, 
      replyTo: replyingTo ? replyingTo : null,
      createdAt: new Date().toISOString(),
      _id: tempId
    };

    socketRef.current.emit('send_message', msgData);
    setInputText("");
    setReplyingTo(null);
  };

  const pickImage = async (useCamera: boolean) => {
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.2 }) 
      : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.2 });

    if (!result.canceled && result.assets) {
        const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
        sendMessage(base64Img);
    }
  };

  const handleLongPress = (msg: any) => { setSelectedMessage(msg); setModalVisible(true); };
  const handleCopy = async () => { if (selectedMessage.text) await Clipboard.setStringAsync(selectedMessage.text); setModalVisible(false); };
  const handleReply = () => { setReplyingTo(selectedMessage); setModalVisible(false); };
  
  const handleDelete = () => {
    if (selectedMessage.senderId === (user._id || user.googleId)) {
      socketRef.current.emit('delete_message', { messageId: selectedMessage._id, roomId });
    } else {
      setMessages(prev => prev.filter(m => m !== selectedMessage));
    }
    setModalVisible(false);
  };

  const handleReaction = (emoji: string) => {
    setMessages(prev => prev.map(msg => msg._id === selectedMessage._id ? { ...msg, reaction: emoji } : msg));
    socketRef.current.emit('add_reaction', { messageId: selectedMessage._id, roomId, emoji });
    setModalVisible(false);
  };

  const openImage = (uri: string) => {
    setViewImageUri(uri);
    setFullImageVisible(true);
  };

  return (
    <View style={styles.container}>
      
      {/* 1. STATUS BAR */}
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* 2. SPACER FOR REDMI/ANDROID NOTCH */}
      <View style={{ height: 40, backgroundColor: '#075E54' }} />

      {/* 3. HEADER */}
      <View style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity onPress={onBack} style={{paddingRight: 10}}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} style={{ width: 35, height: 35, borderRadius: 18 }} />
            <Text style={styles.headerTitle}>{chatWithUser.name}</Text>
        </View>
        <View style={{flexDirection:'row', gap: 15}}>
            <Ionicons name="videocam" size={22} color="#fff" />
            <Ionicons name="call" size={20} color="#fff" />
            <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
        </View>
      </View>

      {/* 
          👉 FIX YAHAN HAI: 
          behavior="height" android ke liye zaroori hai agar header fixed hai.
      */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} // Zarurat pade to ise 20-30 kar dena
      >
        
        {/* CHAT AREA */}
        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            inverted={true} 
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ padding: 15 }}
            renderItem={({ item }) => {
              const isMe = item.senderId === (user._id || user.googleId);
              return (
                <TouchableOpacity activeOpacity={0.8} onLongPress={() => handleLongPress(item)}>
                  <View style={[styles.msgWrapper, isMe ? {alignItems: 'flex-end'} : {alignItems: 'flex-start'}]}>
                    <View style={[styles.msgBubble, isMe ? styles.myMsg : styles.otherMsg]}>
                      {item.replyTo && (
                        <View style={styles.replyContext}>
                            <View style={styles.replyBarColor} />
                            <View style={styles.replyContent}>
                                <Text style={styles.replyName}>{item.replyTo.senderId === (user._id || user.googleId) ? "You" : chatWithUser.name}</Text>
                                <Text numberOfLines={1} style={styles.replyText}>{item.replyTo.image ? "📷 Photo" : item.replyTo.text}</Text>
                            </View>
                        </View>
                      )}
                      {item.image && (
                        <TouchableOpacity onPress={() => openImage(item.image)}>
                            <Image source={{ uri: item.image }} style={styles.msgImage} resizeMode="cover" />
                        </TouchableOpacity>
                      )}
                      {item.text ? <Text style={[styles.msgText, isMe ? styles.myText : styles.otherText]}>{item.text}</Text> : null}
                      <View style={styles.metaContainer}>
                        <Text style={[styles.timeText, isMe ? {color:'#cfd8dc'} : {color:'#999'}]}>
                            {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ""}
                        </Text>
                        {isMe && <Ionicons name="checkmark-done" size={16} color="#4FC3F7" style={{marginLeft: 4}} />}
                      </View>
                      {item.reaction && (<View style={styles.reactionChip}><Text style={{fontSize: 12}}>{item.reaction}</Text></View>)}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* INPUT AREA */}
        <View style={styles.inputWrapper}>
          {replyingTo && (
              <View style={styles.replyBar}>
                  <View style={styles.replyBarContent}>
                      <Text style={styles.replyBarTitle}>Replying to {replyingTo.senderId === (user._id || user.googleId) ? "Yourself" : chatWithUser.name}</Text>
                      <Text numberOfLines={1} style={styles.replyBarText}>{replyingTo.image ? "📷 Photo" : replyingTo.text}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setReplyingTo(null)}>
                      <Ionicons name="close" size={24} color="#555" />
                  </TouchableOpacity>
              </View>
          )}

          <View style={styles.inputArea}>
              <View style={styles.inputContainer}>
                  <Ionicons name="happy-outline" size={24} color="#ccc" style={{marginRight:5}} />
                  <TextInput 
                      style={styles.input} value={inputText} onChangeText={setInputText} 
                      placeholder="Message" placeholderTextColor="#888" multiline
                  />
                  <TouchableOpacity onPress={() => pickImage(false)} style={{marginHorizontal: 5}}><Ionicons name="attach" size={24} color="#888" /></TouchableOpacity>
                  {!inputText && <TouchableOpacity onPress={() => pickImage(true)} style={{marginHorizontal: 5}}><Ionicons name="camera" size={24} color="#888" /></TouchableOpacity>}
              </View>
              <TouchableOpacity onPress={() => sendMessage()} style={styles.sendBtn}>
                  <Ionicons name={inputText || replyingTo ? "send" : "mic"} size={22} color="#fff" />
              </TouchableOpacity>
          </View>
        </View>

      </KeyboardAvoidingView>

      {/* POPUPS */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.popupContainer}>
              <View style={styles.reactionBar}>
                {['❤️', '😂', '😮', '😢', '😡', '👍'].map((emoji, index) => (
                  <TouchableOpacity key={index} onPress={() => handleReaction(emoji)} style={{padding:5}}>
                    <Text style={{fontSize: 24}}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.menuContainer}>
                <TouchableOpacity style={styles.menuItem} onPress={handleReply}><Text style={styles.menuText}>Reply</Text><Ionicons name="arrow-undo-outline" size={22} color="#fff" /></TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.menuItem} onPress={handleCopy}><Text style={styles.menuText}>Copy</Text><Ionicons name="copy-outline" size={22} color="#fff" /></TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.menuItem} onPress={handleDelete}><Text style={[styles.menuText, {color: '#ff4757'}]}>Delete</Text><Ionicons name="trash-outline" size={22} color="#ff4757" /></TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal visible={fullImageVisible} transparent={true} onRequestClose={() => setFullImageVisible(false)}>
        <View style={styles.fullImageContainer}>
          <StatusBar hidden />
          <TouchableOpacity style={styles.closeImageBtn} onPress={() => setFullImageVisible(false)}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <Image source={{ uri: viewImageUri }} style={styles.fullImage} resizeMode="contain" />
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#075E54' },
  chatContainer: { flex: 1, backgroundColor: '#E5E5E5' },

  header: { 
    paddingTop: 5, 
    paddingBottom: 10, 
    paddingHorizontal: 15, 
    backgroundColor: '#075E54', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    elevation: 4,
    zIndex: 10
  },
  
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginLeft: 10 },
  
  msgWrapper: { width: '100%', marginBottom: 2 },
  msgBubble: { maxWidth: '80%', padding: 5, borderRadius: 10, elevation: 1, minWidth: 100 },
  myMsg: { backgroundColor: '#E7FFDB', borderTopRightRadius: 0 },
  otherMsg: { backgroundColor: '#fff', borderTopLeftRadius: 0 },
  replyContext: { backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 5, padding: 5, marginBottom: 5, flexDirection: 'row', overflow: 'hidden' },
  replyBarColor: { width: 4, backgroundColor: '#075E54', borderRadius: 2, marginRight: 5 },
  replyContent: { flex: 1 },
  replyName: { fontSize: 12, fontWeight: 'bold', color: '#075E54', marginBottom: 2 },
  replyText: { fontSize: 12, color: '#666' },
  msgImage: { width: 220, height: 220, borderRadius: 8, marginBottom: 2 },
  msgText: { fontSize: 16, marginHorizontal: 5, marginTop: 2 },
  myText: { color: '#000' },
  otherText: { color: '#000' },
  metaContainer: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 2, marginRight: 5 },
  timeText: { fontSize: 10 },
  reactionChip: { position: 'absolute', bottom: -10, left: 10, backgroundColor: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#eee' },
  
  inputWrapper: { backgroundColor: '#E5E5E5' },
  replyBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 8, borderLeftWidth: 5, borderLeftColor: '#075E54', margin: 5, borderRadius: 5 },
  replyBarContent: { flex: 1 },
  replyBarTitle: { color: '#075E54', fontWeight: 'bold', fontSize: 12 },
  replyBarText: { color: '#555' },
  inputArea: { flexDirection: 'row', padding: 5, alignItems: 'flex-end', marginBottom: 5 },
  inputContainer: { flex: 1, flexDirection: 'row', backgroundColor: '#fff', borderRadius: 25, paddingHorizontal: 10, paddingVertical: 5, alignItems: 'center', marginLeft: 5, elevation: 2 },
  input: { flex: 1, fontSize: 16, maxHeight: 100, color: '#000' },
  sendBtn: { backgroundColor: '#00897B', width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginLeft: 5, elevation: 2 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  popupContainer: { width: '70%' },
  reactionBar: { flexDirection: 'row', backgroundColor: '#262626', borderRadius: 30, paddingVertical: 10, paddingHorizontal: 15, marginBottom: 15, elevation: 10, width: '100%', justifyContent: 'space-between' },
  menuContainer: { backgroundColor: '#262626', borderRadius: 10, paddingVertical: 5, elevation: 10 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20 },
  menuText: { color: '#fff', fontSize: 16 },
  divider: { height: 0.5, backgroundColor: '#444' },
  fullImageContainer: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: '100%', height: '100%' },
  closeImageBtn: { position: 'absolute', top: 40, right: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 5 }
});