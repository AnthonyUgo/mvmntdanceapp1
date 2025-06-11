import React, { useState, useContext } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Pressable,
  Alert,
  Switch,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { ThemeContext } from '../contexts/ThemedContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';  // Adjust path if needed

type OrganizerSignUpNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OrganizerSignUp'
>;

const OrganizerSignUpScreen = () => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation<OrganizerSignUpNavigationProp>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState('');
  const [acceptedTos, setAcceptedTos] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [message, setMessage] = useState('');

  // Password requirements
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasMinLength = password.length >= 9;

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setDob(formattedDate);
      if (selectedDate.toDateString() === new Date().toDateString()) {
        Alert.alert('🎉 Happy Birthday!', 'We noticed it’s your birthday today!');
      }
    }
  };

  const handleEmailSignUp = async () => {
    if (!firstName || !lastName || !username || !email || !password || !dob || !gender) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    if (!acceptedTos) {
      Alert.alert('Terms Required', 'Please accept the Terms of Service.');
      return;
    }

    try {
      const requestBody = {
        firstName,
        lastName,
        username,
        email,
        password,
        dob,
        gender,
      };

      console.log('🚀 Submitting sign-up:', requestBody);

      const response = await fetch('http://100.110.138.201:5050/api/auth/organizer/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const text = await response.text();
      console.log('🔍 Response Text:', text);

      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        console.error('❌ JSON parse error:', err);
        Alert.alert('Server error', 'Unexpected server response.');
        return;
      }

      if (response.ok) {
        Alert.alert('Sign Up Successful!', 'You can now log in.');
        navigation.navigate('OrganizerLogin');
      } else {
        Alert.alert('Sign Up Failed', data.error || 'An unexpected error occurred.');
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
      if (error instanceof Error) {
        Alert.alert('Server error', error.message);
      } else {
        Alert.alert('Server error', 'An unexpected error occurred.');
      }
    }
  };

  const backgroundColor = theme === 'dark' ? '#1c1c1e' : '#f9f9f9';
  const cardColor = theme === 'dark' ? '#2c2c2e' : '#ffffff';
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const accentColor = '#a259ff';

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.card, { backgroundColor: cardColor, shadowColor: accentColor }]}>
          <Text style={[styles.title, { color: accentColor }]}>Organizer Sign Up</Text>

          <TextInput
            placeholder="First Name"
            placeholderTextColor="#aaa"
            style={[styles.input, { color: textColor }]}
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            placeholder="Last Name"
            placeholderTextColor="#aaa"
            style={[styles.input, { color: textColor }]}
            value={lastName}
            onChangeText={setLastName}
          />
          <TextInput
            placeholder="Username"
            placeholderTextColor="#aaa"
            style={[styles.input, { color: textColor }]}
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#aaa"
            style={[styles.input, { color: textColor }]}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {/* Password Field with Toggle */}
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#aaa"
              style={[styles.input, styles.passwordInput, { color: textColor }]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color={textColor}
              />
            </TouchableOpacity>
          </View>

          {/* Password Requirements */}
          <View style={styles.passwordRequirements}>
            <Text style={{ color: hasUppercase ? 'green' : 'red' }}>• At least one uppercase letter</Text>
            <Text style={{ color: hasNumber ? 'green' : 'red' }}>• At least one number</Text>
            <Text style={{ color: hasSpecialChar ? 'green' : 'red' }}>• At least one special character</Text>
            <Text style={{ color: hasMinLength ? 'green' : 'red' }}>• Minimum 9 characters</Text>
          </View>

          {/* Date of Birth Picker */}
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={[
              styles.input,
              {
                justifyContent: 'center',
                backgroundColor: theme === 'dark' ? '#2c2c2e' : '#f0f0f0',
                paddingHorizontal: 10,
              },
            ]}
          >
            <Text style={{ color: dob ? textColor : '#aaa' }}>
              {dob || 'Date of Birth (YYYY-MM-DD)'}
            </Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={dob ? new Date(dob + 'T00:00:00') : new Date(2000, 0, 1)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          {/* Gender Picker */}
          <Picker
            selectedValue={gender}
            style={[styles.picker, { color: textColor }]}
            onValueChange={(value) => setGender(value)}
          >
            <Picker.Item label="Select Gender" value="" />
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
            <Picker.Item label="Other" value="other" />
          </Picker>

          {/* Terms of Service Switch */}
          <View style={styles.switchContainer}>
            <Switch
              value={acceptedTos}
              onValueChange={setAcceptedTos}
              trackColor={{ false: '#767577', true: accentColor }}
              thumbColor={acceptedTos ? accentColor : '#f4f3f4'}
            />
            <Text style={[styles.tosText, { color: textColor }]}>
              I accept the Terms of Service
            </Text>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: acceptedTos ? accentColor : '#aaa',
              },
            ]}
            onPress={handleEmailSignUp}
            disabled={!acceptedTos}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          {message && <Text style={[styles.message, { color: textColor }]}>{message}</Text>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: { fontSize: 24, fontWeight: 'bold', alignSelf: 'center', marginBottom: 20 },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 8,
  },
  passwordInput: { flex: 1, paddingVertical: 10 },
  passwordRequirements: { marginBottom: 16 },
  picker: { marginBottom: 16 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  tosText: { marginLeft: 8, fontSize: 14 },
  button: { borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  message: { textAlign: 'center', marginTop: 10 },
});

export default OrganizerSignUpScreen;
