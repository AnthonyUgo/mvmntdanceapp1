import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemedContext';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrganizerAccountScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);

  const [name, setName] = useState('Muvs Events');
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [location, setLocation] = useState<string>('Fetching location...');

  const backgroundColor = theme === 'dark' ? '#121212' : '#f9f9f9';
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const accentColor = '#4285F4';

  // Pick image from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your media library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // Fetch saved location or request new one
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const savedLocation = await AsyncStorage.getItem('userLocation');
        if (savedLocation) {
          setLocation(savedLocation);
        } else {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setLocation('Permission denied');
            return;
          }

          let loc = await Location.getCurrentPositionAsync({});
          let reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
          if (reverseGeocode.length > 0) {
            const { city, region } = reverseGeocode[0];
            const locString = `${city || ''}, ${region || ''}`;
            setLocation(locString);
            await AsyncStorage.setItem('userLocation', locString);
          } else {
            setLocation('Location unavailable');
          }
        }
      } catch (error) {
        console.error('Error fetching location:', error);
        setLocation('Error fetching location');
      }
    };

    fetchLocation();
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileCircleImage} />
          ) : (
            <View style={[styles.profileCircle, { backgroundColor: accentColor }]}>
              <Text style={[styles.profileInitial, { color: '#fff' }]}>
                {name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Editable Name */}
        {isEditing ? (
          <TextInput
            style={[styles.profileNameInput, { color: textColor }]}
            value={name}
            onChangeText={setName}
            onBlur={() => setIsEditing(false)}
            autoFocus
          />
        ) : (
          <TouchableOpacity onLongPress={() => setIsEditing(true)}>
            <Text style={[styles.profileName, { color: textColor }]}>{name}</Text>
          </TouchableOpacity>
        )}

        {/* Location */}
        <Text style={[styles.location, { color: textColor }]}>📍 {location}</Text>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Preferences</Text>
        <TouchableOpacity style={styles.item}>
          <Ionicons name="heart-outline" size={20} color={accentColor} />
          <Text style={[styles.itemText, { color: textColor }]}>Interests</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Ionicons name="notifications-outline" size={20} color={accentColor} />
          <Text style={[styles.itemText, { color: textColor }]}>Notifications</Text>
        </TouchableOpacity>
      </View>

      {/* Management Tools Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Management</Text>
        <TouchableOpacity style={styles.item}>
          <Ionicons name="calendar-outline" size={20} color={accentColor} />
          <Text style={[styles.itemText, { color: textColor }]}>Events Managed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Ionicons name="people-outline" size={20} color={accentColor} />
          <Text style={[styles.itemText, { color: textColor }]}>Team Members</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Ionicons name="cash-outline" size={20} color={accentColor} />
          <Text style={[styles.itemText, { color: textColor }]}>Financials</Text>
        </TouchableOpacity>
      </View>

      {/* Support & Legal Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Support & Legal</Text>
        <TouchableOpacity style={styles.item}>
          <Ionicons name="help-circle-outline" size={20} color={accentColor} />
          <Text style={[styles.itemText, { color: textColor }]}>Help Center</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Ionicons name="document-text-outline" size={20} color={accentColor} />
          <Text style={[styles.itemText, { color: textColor }]}>Terms of Service</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Ionicons name="lock-closed-outline" size={20} color={accentColor} />
          <Text style={[styles.itemText, { color: textColor }]}>Privacy</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.signOut}>
          <Ionicons name="log-out-outline" size={20} color={accentColor} />
          <Text style={[styles.itemText, { color: textColor }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  profileSection: { alignItems: 'center', marginBottom: 20 },
  profileCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCircleImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInitial: { fontSize: 32, fontWeight: 'bold' },
  profileName: { fontSize: 20, fontWeight: '600', marginTop: 8 },
  profileNameInput: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  location: { fontSize: 14, marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  itemText: { marginLeft: 12, fontSize: 16 },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
});

export default OrganizerAccountScreen;
