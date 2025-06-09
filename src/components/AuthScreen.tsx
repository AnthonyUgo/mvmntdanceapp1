import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { ThemeContext } from '../contexts/ThemedContext';
import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { getFirebaseAuth } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

WebBrowser.maybeCompleteAuthSession();

const tenantId = '7b7623fe-374a-4c13-83e0-a2567f16508b';
const clientId = '35c321e2-9c8c-4401-9c77-7dba786d3925';
const azureDiscovery = {
  authorizationEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
  tokenEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
  revocationEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout`,
};

const AuthScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  // Google login
  const [googleRequest, googleResponse, promptGoogleLogin] = Google.useIdTokenAuthRequest({
    clientId: '1074387332824-2j90gu9gldca4t19ddtg6k4ea27ecgev.apps.googleusercontent.com',
  });

  // Azure AD login
const redirectUri = AuthSession.makeRedirectUri({
  native: 'mvmntdanceapp://redirect',
  useProxy: true
});

  const [azureRequest, azureResponse, promptAzureLogin] = AuthSession.useAuthRequest(
    {
      clientId,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: 'code',
    },
    azureDiscovery
  );

  useEffect(() => {
    if (azureResponse?.type === 'success') {
      const { code } = azureResponse.params;
      Alert.alert('Azure AD Login', `Auth code: ${code}`);
      // TODO: Exchange code for access token
      navigation.navigate('OrganizerDashboard' as never);
    }
  }, [azureResponse, navigation]);

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
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Login successful!');
      navigation.navigate('OrganizerDashboard' as never);
    } catch (error: any) {
      Alert.alert('Login failed', error.message);
    }
  };

  const handleGoogleLogin = () => {
    promptGoogleLogin();
  };

  const handleAzureLogin = () => {
    promptAzureLogin();
  };

  const handleSignUpPress = () => {
    Alert.alert('Sign Up', 'Sign-up functionality will be implemented soon!');
    // navigation.navigate('SignUp');
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Sign In</Text>
      <Text style={[styles.subtitle, { color: textColor }]}>
        Welcome! Please sign in to continue.
      </Text>

      {/* Login Form */}
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

      {/* Sign In Button */}
      <TouchableOpacity
        style={[styles.signInButton, { backgroundColor: accentColor }]}
        onPress={handleEmailSignIn}
      >
        <Ionicons name="log-in-outline" size={24} color="#fff" />
        <Text style={[styles.signInButtonText, { color: '#fff' }]}>Sign In</Text>
      </TouchableOpacity>

      {/* Google Login Button */}
      <TouchableOpacity
        style={[styles.googleButton, { backgroundColor: inputBackground }]}
        onPress={handleGoogleLogin}
      >
        <Ionicons name="logo-google" size={24} color={accentColor} />
        <Text style={[styles.googleButtonText, { color: textColor }]}>
          Continue with Google
        </Text>
      </TouchableOpacity>

      {/* Azure AD Login Button */}
      <TouchableOpacity
        style={[styles.azureButton, { backgroundColor: inputBackground }]}
        onPress={handleAzureLogin}
      >
        <Ionicons name="logo-microsoft" size={24} color={accentColor} />
        <Text style={[styles.googleButtonText, { color: textColor }]}>
          Continue with Azure AD
        </Text>
      </TouchableOpacity>

      {/* First Time? Sign Up */}
      <TouchableOpacity onPress={handleSignUpPress} style={styles.signUpContainer}>
        <Text style={[styles.signUpText, { color: textColor }]}>
          First time?{' '}
          <Text style={{ color: accentColor, textDecorationLine: 'underline' }}>
            Sign Up
          </Text>
        </Text>
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
  azureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 10,
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

export default AuthScreen;
