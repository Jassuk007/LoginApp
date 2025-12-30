import { 
  GoogleSignin, 
  isSuccessResponse, 
} from '@react-native-google-signin/google-signin';
import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ⚠️ Ensure your Ngrok URL is correct
  const API_URL = 'https://chat-backend-live.onrender.com'; 

  // --- 1. CONFIGURATION (Ye sabse zaroori step hai) ---
  // Iske bina koi bhi Google function kaam nahi karega
  GoogleSignin.configure({
    webClientId: "354250370440-25112dslrmd811iktak7fk334csqqje7.apps.googleusercontent.com", 
    offlineAccess: true,
    scopes: ['profile', 'email'],
  });

  // --- Backend Verification Function ---
  const handleBackendLogin = async (token: string) => {
    try {
      console.log("Verifying token with backend...");
      const res = await axios.post(`${API_URL}/api/auth/google`, { token });
      
      console.log("User verified:", res.data.user.email);
      setUser(res.data.user);
    } catch (e) {
      console.error("Backend login failed:", e);
      await GoogleSignin.signOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // --- App Start Logic (Auto Login) ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        await GoogleSignin.hasPlayServices();
        
        // Silent Sign-In attempt
        const response = await GoogleSignin.signInSilently();

        if (isSuccessResponse(response)) {
          const token = response.data.idToken; 
          if (token) {
            await handleBackendLogin(token);
          } else {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        // Agar user logged in nahi hai, to ye error aayega (Normal hai)
        setIsLoading(false); 
      }
    };

    initAuth();
  }, []);

  // --- Logout Function ---
  const logout = async () => {
    try {
      await GoogleSignin.signOut();
      setUser(null);
    } catch (e) {
      console.error("Logout Error:", e);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, logout, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);