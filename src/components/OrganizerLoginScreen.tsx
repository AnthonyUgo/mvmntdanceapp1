import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { ThemeContext } from '../contexts/ThemedContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

WebBrowser.maybeCompleteAuthSession();

type OrganizerLoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OrganizerLogin'
>;

const OrganizerLoginScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<OrganizerLoginScreenNavigationProp>();

  const [googleRequest, googleResponse, promptGoogleLogin] = Google.useIdTokenAuthRequest({
    clientId: '1074387332824-2j90gu9gldca4t19ddtg6k4ea27ecgev.apps.googleusercontent.com',
  });

  const backgroundColor = theme === 'dark' ? '#121212' : '#fff';
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const inputBackground = theme === 'dark' ? '#1e1e1e' : '#f0f0f0';
  const accentColor = '#4285F4';

  const handleEmailSignIn = async () => {
  if (!email || !password) {
    Alert.alert('Missing Fields', 'Please enter both email and password.');
    return;
  }

  try {
    const response = await fetch('https://3888-2605-ad80-90-c057-d1a2-a756-d240-92fe.ngrok-free.app/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (err) {
      Alert.alert('Server error.', 'Unexpected server response.');
      return;
    }

    if (response.ok) {
      const profile = data.profile || data.organizer;

      if (!profile) {
        Alert.alert('Login Failed', 'Profile not found in server response.');
        return;
      }

      const basePairs: [string, string][] = [
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
        basePairs.push(['organizerUsername', profile.username || '']);
      }

      await AsyncStorage.multiSet(basePairs);

      Alert.alert('Login Successful!', 'Welcome back!');
      setTimeout(() => {
        if (profile.role === 'organizer') {
          navigation.navigate('OrganizerDashboard' as never);
        } else {
          navigation.navigate('UserDashboard' as never);
        }
      }, 500);
    } else {
      Alert.alert('Login Failed', data.error || 'Unknown error.');
    }
  } catch (error) {
    Alert.alert('Server error.', 'Please try again later.');
  }
}; // ✅ this was missing

  const handleGoogleLogin = () => promptGoogleLogin();
  const handleSignUpPress = () => navigation.navigate('OrganizerSignUp' as never);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, { backgroundColor }]}>
          <Text style={[styles.title, { color: textColor }]}>Login</Text>
          <Text style={[styles.subtitle, { color: textColor }]}>
            Welcome! Please sign in to view/manage events.
          </Text>

          <TextInput
            style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
            placeholder="Email"
            placeholderTextColor={theme === 'dark' ? '#888' : '#666'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
            placeholder="Password"
            placeholderTextColor={theme === 'dark' ? '#888' : '#666'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword' as never)}>
            <Text style={{
              color: accentColor,
              textAlign: 'right',
              marginTop: 4,
              marginBottom: 8,
              textDecorationLine: 'underline'
            }}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signInButton, { backgroundColor: accentColor }]}
            onPress={handleEmailSignIn}
          >
            <Ionicons name="log-in-outline" size={24} color="#fff" />
            <Text style={[styles.signInButtonText, { color: '#fff' }]}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.googleButton, { backgroundColor: inputBackground }]}
            onPress={handleGoogleLogin}
          >
            <Ionicons name="logo-google" size={24} color={accentColor} />
            <Text style={[styles.googleButtonText, { color: textColor }]}>
              Continue with Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSignUpPress} style={styles.signUpContainer}>
            <Text style={[styles.signUpText, { color: textColor }]}>
              First time?{' '}
              <Text style={{ color: accentColor, textDecorationLine: 'underline' }}>
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
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    width: '80%',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  signInButtonText: {
    fontSize: 16,
    marginLeft: 8,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  googleButtonText: {
    fontSize: 16,
    marginLeft: 8,
  },
  signUpContainer: {
    marginTop: 20,
  },
  signUpText: {
    fontSize: 14,
  },
});

export default OrganizerLoginScreen;
