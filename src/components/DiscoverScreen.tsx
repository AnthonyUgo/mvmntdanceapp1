// DiscoverScreen.tsx
import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemedContext';
import { SafeAreaView } from 'react-native-safe-area-context';

type EventType = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  venueName: string;
  venueAddress: string;
  image?: string | null;
  price?: string;
  quantity: number;
};

const PUBLIC_EVENTS_URL =
  'https://muvs-backend-abc-e5hse4csf6dhajfy.canadacentral-01.azurewebsites.net/api/events/public';

const DiscoverScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const textColor = isDark ? '#fff' : '#000';
  const bgColor = isDark ? '#121212' : '#fff';

  const [userCity, setUserCity] = useState<string>('');
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // ➊ Get user's city via reverse geocode
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return setUserCity('');
      const loc = await Location.getCurrentPositionAsync({});
      const [place] = await Location.reverseGeocodeAsync(loc.coords);
      setUserCity(place.city || '');
    })();
  }, []);

  // ➋ Fetch & keep only upcoming events
  const fetchEvents = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(PUBLIC_EVENTS_URL);
      if (!res.ok) {
        console.warn('Failed to fetch public events:', res.status);
        return;
      }
      const body = await res.json();
      const raw: EventType[] = Array.isArray(body.events) ? body.events : [];

      const now = Date.now();
      const upcoming = raw.filter(e => {
        const ts = new Date(`${e.date}T${e.startTime}`).getTime();
        return ts >= now;
      });

      // Apply searchTerm filter (by title or venue)
      const filtered = searchTerm.trim()
        ? upcoming.filter(e =>
            e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.venueName.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : upcoming;

      // Optionally: sort ascending
      filtered.sort((a, b) =>
        new Date(`${a.date}T${a.startTime}`).getTime() -
        new Date(`${b.date}T${b.startTime}`).getTime()
      );

      setEvents(filtered);
    } catch (err) {
      console.error('❌ Error fetching events:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // refetch when we know city or searchTerm changes
  useEffect(() => {
    if (userCity !== '' || !loading) {
      fetchEvents();
    }
  }, [userCity, searchTerm]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={textColor} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* ───────── Search + Filter Bar ───────── */}
      <View style={[styles.searchBar, {
        backgroundColor: isDark ? '#1e1e1e' : '#f0f0f0',
        borderColor: isDark ? '#333' : '#ccc'
      }]}>
        <Ionicons name="search-outline" size={20} color={isDark ? '#888' : '#666'} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search events..."
          placeholderTextColor={isDark ? '#555' : '#999'}
          value={searchTerm}
          onChangeText={setSearchTerm}
          returnKeyType="search"
        />
        <TouchableOpacity onPress={() => {/* TODO: open filter modal */}}>
          <Ionicons name="filter-outline" size={20} color={isDark ? '#888' : '#666'} />
        </TouchableOpacity>
      </View>

      {/* ───────── Event List ───────── */}
      <FlatList
        data={events}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchEvents} />
        }
        contentContainerStyle={events.length === 0 ? styles.center : { padding: 16 }}
        ListEmptyComponent={
          <Text style={{ color: textColor, textAlign: 'center' }}>
            No upcoming events{ userCity ? ` in ${userCity}` : '' }.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.image} />
            ) : null}
            <Text style={[styles.title, { color: textColor }]}>{item.title}</Text>
            <Text style={{ color: textColor }}>
              {item.date} • {item.startTime}
            </Text>
            <Text style={{ color: textColor }}>{item.venueName}</Text>
            <Text style={{ color: textColor }}>{item.price ?? 'Free'}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    height: '100%',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 12,
    elevation: 2,
  },
  image: { width: '100%', height: 180, borderRadius: 8, marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
});

export default DiscoverScreen;
