// src/components/DiscoverScreen.tsx
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
  visibility?: string;
};

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

  // get user city but do NOT gate the fetch on it
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      const [place] = await Location.reverseGeocodeAsync(loc.coords);
      setUserCity(place.city || '');
    })();
  }, []);

  // fetch once on mount and also on manual refresh or searchTerm change
  const fetchEvents = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const res = await fetch('https://muvs-backend-abc-e5hse4csf6dhajfy.canadacentral-01.azurewebsites.net/api/events/public');
      console.log('Discover fetch status:', res.status);
      const body = await res.json();
      console.log('Discover response body:', body);
      const raw: EventType[] = Array.isArray(body.events) ? body.events : [];
      const now = Date.now();
      let filtered = raw
        .filter(e => e.visibility === 'public')
        .filter(e => {
          // normalize non-breaking spaces
          const cleanTime = e.startTime.replace(/\u202F/g, ' ');
          const ts = Date.parse(`${e.date} ${cleanTime}`);
          return !isNaN(ts) && ts >= now;
        });

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        filtered = filtered.filter(e =>
          e.title.toLowerCase().includes(q) ||
          e.venueName.toLowerCase().includes(q)
        );
      }

      filtered.sort((a, b) => {
        const ta = Date.parse(`${a.date} ${a.startTime.replace(/\u202F/g,' ')}`);
        const tb = Date.parse(`${b.date} ${b.startTime.replace(/\u202F/g,' ')}`);
        return ta - tb;
      });

      setEvents(filtered);
    } catch (err) {
      console.error('Error fetching discover events:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [searchTerm]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={textColor} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
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
        <TouchableOpacity onPress={fetchEvents}>
          <Ionicons name="filter-outline" size={20} color={isDark ? '#888' : '#666'} />
        </TouchableOpacity>
      </View>

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
              {item.date} • {new Date(`${item.date} ${item.startTime.replace(/\u202F/g,' ')}`)
                .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
  container:   { flex: 1 },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchBar:   { flexDirection: 'row', alignItems: 'center', margin: 16, paddingHorizontal: 12, height: 40, borderRadius: 20, borderWidth: 1 },
  searchInput: { flex: 1, marginHorizontal: 8, height: '100%' },
  card:        { marginBottom: 16, borderRadius: 12, overflow: 'hidden', padding: 12, elevation: 2 },
  image:       { width: '100%', height: 180, borderRadius: 8, marginBottom: 8 },
  title:       { fontSize: 18, fontWeight: '600', marginBottom: 4 },
});

export default DiscoverScreen;
