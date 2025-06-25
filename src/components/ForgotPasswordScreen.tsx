import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ThemeContext } from '../contexts/ThemedContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type ForgotPasswordNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ForgotPassword'
>;

const API_URL = 'https://muvs-backend-abc-e5hse4csf6dhajfy.canadacentral-01.azurewebsites.net/api/auth/forgot-password';

const ForgotPasswordScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation<ForgotPasswordNavigationProp>();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const backgroundColor = theme === 'dark' ? '#121212' : '#fff';
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const inputBackground = theme === 'dark' ? '#1e1e1e' : '#f0f0f0';
  const accentColor = '#4285F4';

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Missing Field', 'Please enter your email.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', data.message || 'Check your email for reset instructions.');
        navigation.goBack();
      } else {
        Alert.alert('Error', data.error || 'Failed to send reset instructions.');
      }
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      Alert.alert('Server Error', 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Forgot Password</Text>
      <Text style={[styles.subtitle, { color: textColor }]}>
        Enter your email to receive reset instructions.
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

      <TouchableOpacity
        style={[styles.button, { backgroundColor: accentColor }]}
        onPress={handleForgotPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="mail-outline" size={24} color="#fff" />
            <Text style={[styles.buttonText, { color: '#fff' }]}>Send Reset Link</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backContainer}>
        <Text style={[styles.backText, { color: accentColor }]}>← Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  input: {
    width: '100%',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    minWidth: 180,
    justifyContent: 'center',
  },
  buttonText: { fontSize: 16, marginLeft: 8 },
  backContainer: { marginTop: 20 },
  backText: { fontSize: 14, textDecorationLine: 'underline' },
});

export default ForgotPasswordScreen;
