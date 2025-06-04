import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { getAuth, signInWithEmailAndPassword, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { app } from '../firebase/config';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

// Complete the auth session on redirect (needed for Google login)
WebBrowser.maybeCompleteAuthSession();

const auth = getAuth(app);

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Google Sign-In
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '725624410329-qoqabsqmhabi1d62hetqba327lbdpsuk.apps.googleusercontent.com', // Replace with your Google Web Client ID
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);

      signInWithCredential(auth, credential)
        .then(() => {
          Alert.alert('Login with Google successful!');
          // Navigate to the next screen here
        })
        .catch((error) => {
          Alert.alert('Google login failed', error.message);
        });
    }
  }, [response]);

  // Email/Password Login
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Login successful!');
      // Navigate to the next screen here
    } catch (error: any) {
      Alert.alert('Login failed', error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>afroMVMNT Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{
          backgroundColor: '#fff',
          padding: 10,
          marginBottom: 10,
          borderRadius: 5,
        }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          backgroundColor: '#fff',
          padding: 10,
          marginBottom: 10,
          borderRadius: 5,
        }}
      />
      <Button title="Login" onPress={handleLogin} />

      <Text style={{ textAlign: 'center', marginVertical: 10, fontWeight: 'bold' }}>OR</Text>
      <Button
        title="Login with Google"
        onPress={() => promptAsync()}
        color="#4285F4"
      />
    </View>
  );
};

export default LoginScreen;
