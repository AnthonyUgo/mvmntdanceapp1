import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider
} from 'firebase/auth';
import { app } from '../firebase/config';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native'; // Added useIsFocused

// Complete the auth session on redirect
WebBrowser.maybeCompleteAuthSession();

const auth = getAuth(app);

// Define your stack's param list
type RootStackParamList = {
  Login: undefined;
  auth: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isFocused = useIsFocused(); // Added isFocused

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '725624410329-qoqabsqmhabi1d62hetqba327lbdpsuk.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (isFocused && response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(() => {
          Alert.alert('Login with Google successful!');
          navigation.navigate('auth');
        })
        .catch((error) => {
          Alert.alert('Google login failed', error.message);
        });
    }
  }, [isFocused, response, navigation]); // Added isFocused and navigation to deps

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Login successful!');
      navigation.navigate('auth');
    } catch (error: any) {
      Alert.alert('Login failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>afroMVMNT Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Button title="Login" onPress={handleLogin} />

      <Text style={styles.orText}>OR</Text>
      <Button
        title="Login with Google"
        onPress={() => promptAsync()}
        color="#4285F4"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  orText: {
    textAlign: 'center',
    marginVertical: 10,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
