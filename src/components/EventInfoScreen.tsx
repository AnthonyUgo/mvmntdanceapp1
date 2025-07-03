import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../contexts/ThemedContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { API_BASE_URL } from '@env';



interface RouteParams {
  eventId: string;
  organizerId: string;
}

const EventInfoScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const textColor = isDark ? '#fff' : '#000';
  const bgColor = isDark ? '#121212' : '#fff';

  
  const route = useRoute();
  const { eventId, organizerId } = route.params as RouteParams;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [event, setEvent] = useState<any>(null);
  const [organizer, setOrganizer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        const userRes =  await axios.get(`${API_BASE_URL}/api/users/get?email=${email}`);
        const username = userRes.data.user.username;
        setCurrentUsername(username);

        const eventRes = await axios.get(`${API_BASE_URL}/api/events/${eventId}?organizerId=${organizerId}`);
        setEvent(eventRes.data);

        const organizerRes = await axios.get(`${API_BASE_URL}/api/users/by-username?username=${eventRes.data.organizerId}`);
        setOrganizer(organizerRes.data.user);
      } catch (err) {
        console.error('❌ Error loading event:', err);
        Alert.alert('Error', 'Unable to load event details.');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, []);

  if (loading || !event) {
    return (
      <View style={[styles.center, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={textColor} />
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: bgColor }} contentContainerStyle={{ paddingBottom: 80 }}>
      {event.image && <Image source={{ uri: event.image }} style={styles.image} />}
      <View style={{ padding: 16 }}>
        <Text style={[styles.title, { color: textColor }]}>{event.title}</Text>
        <Text style={[styles.subtitle, { color: textColor }]}>
          {event.venueName} • {event.venueAddress}
        </Text>
        <Text style={[styles.subtitle, { color: textColor, marginTop: 4 }]}>
          {event.startDate} at {event.startTime}
        </Text>

        <View style={{ marginTop: 16 }}>
          <Text style={[styles.sectionHeader, { color: textColor }]}>Overview</Text>
          <Text style={[styles.paragraph, { color: textColor }]}>{event.description}</Text>
        </View>

        {organizer && (
          <View style={{ marginTop: 24 }}>
            <Text style={[styles.sectionHeader, { color: textColor }]}>Organized by</Text>
            <View style={styles.organizerRow}>
              <Image source={{ uri: organizer.profileImage }} style={styles.organizerAvatar} />
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.organizerName, { color: textColor }]}>{organizer.username}</Text>
                <Text style={{ color: isDark ? '#ccc' : '#666' }}>
                  Followers {organizer.followers.length ?? 0}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {currentUsername === event.organizerId && (
        <TouchableOpacity
          style={styles.manageButton}
          onPress={() => navigation.navigate('ManageEvent', { eventId })}
        >
          <Text style={styles.manageText}>Manage Event</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 220 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 16, marginTop: 2 },
  sectionHeader: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  paragraph: { fontSize: 15, marginTop: 8, lineHeight: 22 },
  organizerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  organizerAvatar: { width: 50, height: 50, borderRadius: 25 },
  organizerName: { fontSize: 16, fontWeight: '500' },
  manageButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#a259ff',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  manageText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default EventInfoScreen;
