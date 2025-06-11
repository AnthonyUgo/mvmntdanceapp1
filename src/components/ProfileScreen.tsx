import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../contexts/ThemedContext';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();

  const [fields, setFields] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    dob: '',
    gender: '',
    createdAt: '',
  });

  const [editingField, setEditingField] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const keys = [
          'userFirstName',
          'userLastName',
          'userUsername',
          'userEmail',
          'userDob',
          'userGender',
          'userCreatedAt',
        ];

        const values = await AsyncStorage.multiGet(keys);

        const data: any = {};
        values.forEach(([key, value]) => {
          switch (key) {
            case 'userFirstName':
              data.firstName = value || '';
              break;
            case 'userLastName':
              data.lastName = value || '';
              break;
            case 'userUsername':
              data.username = value || '';
              break;
            case 'userEmail':
              data.email = value || '';
              break;
            case 'userDob':
              data.dob = value || '';
              break;
            case 'userGender':
              data.gender = value || '';
              break;
            case 'userCreatedAt':
              data.createdAt = value || '';
              break;
          }
        });

        setFields(data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        Alert.alert('Error', 'Failed to load profile data.');
      }
    };

    fetchUserData();
  }, []);

  const backgroundColor = theme === 'dark' ? '#121212' : '#f9f9f9';
  const cardColor = theme === 'dark' ? '#1e1e1e' : '#ffffff';
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const accentColor = '#ff6f61';

  const handleFieldEdit = (fieldName: keyof typeof fields, newValue: string) => {
    setFields((prevFields) => ({
      ...prevFields,
      [fieldName]: newValue,
    }));
  };

  const handleFieldBlur = async (fieldName: keyof typeof fields) => {
    try {
      let key = '';
      switch (fieldName) {
        case 'firstName':
          key = 'userFirstName';
          break;
        case 'lastName':
          key = 'userLastName';
          break;
        case 'username':
          key = 'userUsername';
          break;
        case 'email':
          key = 'userEmail';
          break;
        case 'dob':
          key = 'userDob';
          break;
        case 'gender':
          key = 'userGender';
          break;
        default:
          break;
      }
      if (key) {
        await AsyncStorage.setItem(key, fields[fieldName]);
      }
      setEditingField(null);
    } catch (error) {
      console.error('Error saving profile data:', error);
      Alert.alert('Error', 'Failed to save profile data.');
    }
  };

  const renderField = (
    label: string,
    value: string,
    fieldKey: keyof typeof fields,
    iconName: any
  ) => (
    <TouchableOpacity
      key={fieldKey}
      onLongPress={() => setEditingField(fieldKey)}
      style={[styles.card, { backgroundColor: cardColor }]}
    >
      <View style={styles.iconLabelRow}>
        <Ionicons name={iconName} size={20} color={accentColor} style={styles.icon} />
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      </View>
      {editingField === fieldKey ? (
        <TextInput
          style={[styles.input, { color: textColor, borderBottomColor: accentColor }]}
          value={value}
          onChangeText={(text) => handleFieldEdit(fieldKey, text)}
          onBlur={() => handleFieldBlur(fieldKey)}
          autoFocus
        />
      ) : (
        <Text style={[styles.value, { color: textColor }]}>
          {fieldKey === 'username' ? `@${value}` : value || 'N/A'}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={accentColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Profile</Text>
        <View style={{ width: 24 }} /> {/* Placeholder for layout balance */}
      </View>

      {/* Note */}
      <Text style={[styles.note, { color: textColor }]}>Hold a field to edit</Text>

      {/* Fields */}
      {renderField('First Name', fields.firstName, 'firstName', 'person')}
      {renderField('Last Name', fields.lastName, 'lastName', 'person')}
      {renderField('Username', fields.username, 'username', 'at')}
      {renderField('Email', fields.email, 'email', 'mail')}
      {renderField('Date of Birth', fields.dob, 'dob', 'calendar')}
      {renderField('Gender', fields.gender, 'gender', 'male-female')}
      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <View style={styles.iconLabelRow}>
          <Ionicons name="time-outline" size={20} color={accentColor} style={styles.icon} />
          <Text style={[styles.label, { color: textColor }]}>Account Created</Text>
        </View>
        <Text style={[styles.value, { color: textColor }]}>
          {fields.createdAt ? new Date(fields.createdAt).toDateString() : 'N/A'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  note: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  iconLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  icon: { marginRight: 8 },
  label: { fontSize: 14, fontWeight: '600' },
  value: { fontSize: 16 },
  input: {
    fontSize: 16,
    borderBottomWidth: 1,
    paddingVertical: 4,
  },
});

export default ProfileScreen;
