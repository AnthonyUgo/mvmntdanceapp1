// src/components/OrganizerLoginScreen.tsx
import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { ThemeContext } from '../contexts/ThemedContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { login } from '../api/auth';  // ← centralized login call

WebBrowser.maybeCompleteAuthSession();

type NavProp = NativeStackNavigationProp<RootStackParamList, 'OrganizerLogin'>;

const OrganizerLoginScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<NavProp>();

  const [_, __, promptGoogleLogin] = Google.useIdTokenAuthRequest({
    clientId: '1074387332824-2j90gu9gldca4t19ddtg6k4ea27ecgev.apps.googleusercontent.com',
  });

  const bg = theme === 'dark' ? '#121212' : '#fff';
  const fg = theme === 'dark' ? '#fff' : '#000';
  const inputBg = theme === 'dark' ? '#1e1e1e' : '#f0f0f0';
  const accent = '#4285F4';

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      return Alert.alert('Missing Fields', 'Please enter both email and password.');
    }
    try {
      const data = await login(email, password);
      const profile = data.profile || data.organizer;
      if (!profile) throw new Error('Profile missing');
      const pairs: [string, string][] = [
        ['userFirstName', profile.firstName || ''],
        ['userLastName', profile.lastName || ''],
        ['userUsername', profile.username || ''],
        ['userEmail', profile.email || ''],
        ['userCreatedAt', profile.createdAt || ''],
        ['userDob', profile.dob || ''],
        ['userGender', profile.gender || ''],
        ['userRole', profile.role || ''],
      ];
      if (profile.role === 'organizer') {
        pairs.push(['organizerUsername', profile.username]);
      }
      await AsyncStorage.multiSet(pairs);
      Alert.alert('Success', 'Welcome back!');
      navigation.navigate(profile.role === 'organizer' ? 'OrganizerDashboard' : 'UserDashboard');
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={[styles.title, { color: fg }]}>Login</Text>
          <Text style={[styles.subtitle, { color: fg }]}>
            Sign in to manage your events
          </Text>

          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: fg }]}
            placeholder="Email"
            placeholderTextColor={theme === 'dark' ? '#888' : '#666'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: fg }]}
            placeholder="Password"
            placeholderTextColor={theme === 'dark' ? '#888' : '#666'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotLink}
          >
            <Text style={{ color: accent }}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: accent }]}
            onPress={handleEmailSignIn}
          >
            <Ionicons name="log-in-outline" size={24} color="#fff" />
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
              style={[styles.button, { backgroundColor: inputBg }]}
              onPress={() => promptGoogleLogin()}
           >
            <Ionicons name="logo-google" size={24} color={accent} />
            <Text style={[styles.buttonText, { color: fg }]}>
              Continue with Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('OrganizerSignUp')}
            style={styles.signUpContainer}
          >
            <Text style={{ color: fg }}>
              First time?{' '}
              <Text style={{ color: accent, textDecorationLine: 'underline' }}>
                Sign Up
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    // subtle shadow
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  signUpContainer: {
    marginTop: 20,
  },
});

export default OrganizerLoginScreen;
