// src/screens/SignUpScreen.tsx

import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemedContext';
import { useNavigation } from '@react-navigation/native';

const SignUpScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const backgroundColor = theme === 'dark' ? '#121212' : '#fff';
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const inputBackground = theme === 'dark' ? '#1e1e1e' : '#f0f0f0';
  const accentColor = '#4285F4';

  const handleSignUp = async () => {
    if (!username || !password) {
      Alert.alert('Missing Fields', 'Please enter both username and password.');
      return;
    }
    try {
      const userData = { username, password };
      // Save user locally
      await AsyncStorage.setItem(`user_${username}`, JSON.stringify(userData));
      Alert.alert('Success', 'Account created successfully!');
      navigation.goBack(); // Go back to AuthScreen
    } catch (error) {
      Alert.alert('Error', 'Could not create account.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Sign Up</Text>

      <TextInput
        style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
        placeholder="Username"
        placeholderTextColor={theme === 'dark' ? '#888' : '#666'}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
        placeholder="Password"
        placeholderTextColor={theme === 'dark' ? '#888' : '#666'}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.signUpButton, { backgroundColor: accentColor }]}
        onPress={handleSignUp}
      >
        <Ionicons name="person-add-outline" size={24} color="#fff" />
        <Text style={styles.signUpButtonText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    width: '80%',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  signUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  signUpButtonText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#fff',
  },
});

export default SignUpScreen;
