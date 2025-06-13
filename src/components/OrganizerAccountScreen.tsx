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
import { useNavigation } from '@react-navigation/native';

const OrganizerAccountScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [location, setLocation] = useState<string>('Fetching location...');
  const [isEditing, setIsEditing] = useState(false);

  const backgroundColor = theme === 'dark' ? '#121212' : '#f9f9f9';
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const accentColor = '#4285F4';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedFirstName = await AsyncStorage.getItem('userFirstName');
        const storedLastName = await AsyncStorage.getItem('userLastName');
        const storedUsername = await AsyncStorage.getItem('userUsername');

        if (storedFirstName) setFirstName(storedFirstName);
        if (storedLastName) setLastName(storedLastName);
        if (storedUsername) setUsername(storedUsername);

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
        console.error('Error fetching user data:', error);
        setLocation('Error fetching location');
      }
    };

    fetchUserData();
  }, []);

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

  const handleProfilePress = () => {
    navigation.navigate('Profile' as never);
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings' as never);
  };

  const handleSignOut = async () => {
    try {
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' as never }],
      });
    } catch (err) {
      console.error('Error during sign out:', err);
      Alert.alert('Error', 'Failed to sign out.');
    }
  };

  const displayName = firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Muvs Events';
  const displayUsername = username ? `@${username}` : '@muvs_username';

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
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Editable Name */}
        {isEditing ? (
          <TextInput
            style={[styles.profileNameInput, { color: textColor }]}
            value={displayName}
            onChangeText={(text) => {
              const parts = text.split(' ');
              setFirstName(parts[0] || '');
              setLastName(parts.slice(1).join(' ') || '');
            }}
            onBlur={() => setIsEditing(false)}
            autoFocus
          />
        ) : (
          <TouchableOpacity onLongPress={() => setIsEditing(true)}>
            <Text style={[styles.profileName, { color: textColor }]}>{displayName}</Text>
          </TouchableOpacity>
        )}

        {/* Username */}
        <Text style={[styles.username, { color: textColor }]}>{displayUsername}</Text>

        {/* Location */}
        <Text style={[styles.location, { color: textColor }]}>📍 {location}</Text>
      </View>

      {/* Profile Button */}
      <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
        <Ionicons name="person-outline" size={20} color={accentColor} />
        <Text style={[styles.itemText, { color: textColor }]}>View Profile</Text>
      </TouchableOpacity>

      {/* Settings Button */}
      <TouchableOpacity style={styles.profileButton} onPress={handleSettingsPress}>
        <Ionicons name="settings-outline" size={20} color={accentColor} />
        <Text style={[styles.itemText, { color: textColor }]}>Settings</Text>
      </TouchableOpacity>

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
        <TouchableOpacity style={styles.signOut} onPress={handleSignOut}>
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
  username: { fontSize: 16, marginTop: 4 },
  location: { fontSize: 14, marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  itemText: { marginLeft: 12, fontSize: 16 },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
});

export default OrganizerAccountScreen;
