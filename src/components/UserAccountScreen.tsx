import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Image, Alert, Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemedContext';
import * as Location from 'expo-location';
import { isOrganizer } from '../utils/user';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App'; 

const API_URL = 'https://3888-2605-ad80-90-c057-d1a2-a756-d240-92fe.ngrok-free.app/api';

const UserAccountScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();

  const [user, setUser] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [location, setLocation] = useState('Fetching location...');
  const [isEditingName, setIsEditingName] = useState(false);
  const [organizerMode, setOrganizerMode] = useState(false);

  const backgroundColor = theme === 'dark' ? '#121212' : '#fff';
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const accentColor = '#a259ff';

  useEffect(() => {
  (async () => {
    const email = await AsyncStorage.getItem('userEmail');
    if (email) {
      try {
        const res = await fetch(`${API_URL}/users/get?email=${email}`);
        if (!res.ok) {
          const errorText = await res.text();
          console.warn('❌ Server returned non-JSON error page:', errorText);
          return;
        }

        const data = await res.json();
        setUser(data.user);
        setProfileImage(data.user.profileImage);
        if (data.user.location) setLocation(data.user.location);

        // ✅ This is now correctly placed AFTER the user is set
        const savedMode = await AsyncStorage.getItem('organizerMode');
        if (savedMode === 'true') setOrganizerMode(true);

      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    }

    const storedLocation = await AsyncStorage.getItem('userLocation');
    if (storedLocation) {
      setLocation(storedLocation);
    } else {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocation('Permission denied');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      let geo = await Location.reverseGeocodeAsync(loc.coords);
      const city = geo[0]?.city || 'Unknown';
      const region = geo[0]?.region || '';
      const fullLoc = `${city}, ${region}`;
      setLocation(fullLoc);
      await AsyncStorage.setItem('userLocation', fullLoc);
    }
  })();
}, []);


  const handleSignOut = async () => {
    await AsyncStorage.clear();
    navigation.reset({ index: 0, routes: [{ name: 'Home' as never }] });
  };

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
      const imageUri = result.assets[0].uri;
      setProfileImage(imageUri);
      await uploadProfileImageToServer(imageUri);
    }
  };

  const uploadProfileImageToServer = async (uri: string) => {
    try {
      const username = user?.username;
      if (!username) return;
      const formData = new FormData();
      const fileName = uri.split('/').pop() || 'profile.jpg';
      const fileType = uri.split('.').pop();
      const imageFile: any = {
        uri,
        name: fileName,
        type: `image/${fileType}`,
      };
      formData.append('image', imageFile);
      formData.append('username', username);

      const res = await fetch(`${API_URL}/users/upload-profile-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setProfileImage(data.imageUrl);
        await fetch(`${API_URL}/users/profile-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, imageUri: data.imageUrl }),
        });
      } else {
        Alert.alert('Upload failed', data.error || 'Try again later');
      }
    } catch (err) {
      console.error('Image upload error:', err);
    }
  };

  const displayName = user ? `${user.firstName} ${user.lastName}` : 'User';
  const username = user?.username || '@user';
  const followers = user?.followers?.length || 0;
  const following = user?.following?.length || 0;

  const handleBecomeOrganizer = () => {
    navigation.navigate('OrganizerSignUp' as never); // Adjust route name if needed
  };

  const handleToggleMode = async (value: boolean) => {
    setOrganizerMode(value);
    await AsyncStorage.setItem('organizerMode', value.toString());
    if (value) {
      navigation.navigate('OrganizerDashboard' as never);
    } 
  };

  return (
  <SafeAreaView style={{ flex: 1, backgroundColor }}>
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileCircleImage} />
          ) : (
            <View style={[styles.profileCircle, { backgroundColor: accentColor }]}>
              <Text style={styles.profileInitial}>{displayName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </TouchableOpacity>

        {isEditingName ? (
          <TextInput
            style={[styles.profileNameInput, { color: textColor }]}
            value={displayName}
            onChangeText={() => {}}
            onBlur={() => setIsEditingName(false)}
            autoFocus
          />
        ) : (
          <TouchableOpacity onLongPress={() => setIsEditingName(true)}>
            <Text style={[styles.profileName, { color: textColor }]}>{displayName}</Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.username, { color: textColor }]}>{`@${username}`}</Text>
        <Text style={[styles.location, { color: textColor }]}>{`📍 ${location}`}</Text>

        <View style={styles.followerStats}>
          <Text style={{ color: textColor }}>{followers} Followers</Text>
          <Text style={{ color: textColor, marginLeft: 16 }}>{following} Following</Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.item}>
          <Ionicons name="heart-outline" size={20} color={accentColor} />
          <Text style={[styles.itemText, { color: textColor }]}>Interests</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Ionicons name="notifications-outline" size={20} color={accentColor} />
          <Text style={[styles.itemText, { color: textColor }]}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={accentColor} />
          <Text style={[styles.itemText, { color: textColor }]}>Communities</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Ionicons name="bookmark-outline" size={20} color={accentColor} />
          <Text style={[styles.itemText, { color: textColor }]}>Saved Events</Text>
        </TouchableOpacity>

        {/* Become Organizer or Toggle */}
        {isOrganizer(user) ? (
  <View style={styles.item}>
    <Ionicons name="swap-horizontal-outline" size={20} color={accentColor} />
    <Text style={[styles.itemText, { color: textColor, flex: 1 }]}>Organizer Mode</Text>
    <Switch
      value={organizerMode}
      onValueChange={handleToggleMode}
      trackColor={{ false: '#ccc', true: accentColor }}
      thumbColor={organizerMode ? '#fff' : '#fff'}
    />
  </View>
) : (
  <TouchableOpacity style={styles.item} onPress={handleBecomeOrganizer}>
    <Ionicons name="briefcase-outline" size={20} color={accentColor} />
    <Text style={[styles.itemText, { color: textColor }]}>Become an Organizer</Text>
  </TouchableOpacity>
)}
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.item}>
          <Ionicons name="help-circle-outline" size={20} color={accentColor} />
          <Text style={[styles.itemText, { color: textColor }]}>Help Center</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Ionicons name="document-text-outline" size={20} color={accentColor} />
          <Text style={[styles.itemText, { color: textColor }]}>Terms of Service</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Ionicons name="shield-checkmark-outline" size={20} color={accentColor} />
          <Text style={[styles.itemText, { color: textColor }]}>Privacy</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.item} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={accentColor} />
          <Text style={[styles.itemText, { color: textColor }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
          </ScrollView>
  </SafeAreaView>
);
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileSection: { alignItems: 'center', marginBottom: 20 },
  profileCircle: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center'
  },
  scrollContent: {
  padding: 16,
  paddingBottom: 40,
},
  profileCircleImage: {
    width: 80, height: 80, borderRadius: 40,
  },
  profileInitial: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  profileName: { fontSize: 20, fontWeight: '600', marginTop: 8 },
  profileNameInput: {
    fontSize: 20, fontWeight: '600', marginTop: 8, borderBottomWidth: 1, borderColor: '#ccc'
  },
  username: { fontSize: 16, marginTop: 4 },
  location: { fontSize: 14, marginTop: 4 },
  section: { marginVertical: 16 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  itemText: { marginLeft: 12, fontSize: 16 },
  followerStats: { flexDirection: 'row', marginTop: 10 },
});

export default UserAccountScreen;
