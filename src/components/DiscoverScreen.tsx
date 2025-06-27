// src/components/DiscoverScreen.tsx
import React, { useContext, useEffect, useState, useRef } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemedContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPublicEvents } from '../api';

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
  const isDark    = theme === 'dark';
  const textColor = isDark ? '#fff' : '#000';
  const bgColor   = isDark ? '#121212' : '#fff';

  const [events, setEvents]         = useState<EventType[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  // debounce the searchTerm by 500ms
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedTerm(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // fetch on mount and whenever debouncedTerm changes
  useEffect(() => {
    fetchEvents();
  }, [debouncedTerm]);

  const fetchEvents = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      // 1️⃣ pull **all** public events, regardless of city
      const { events: raw } = await getPublicEvents();

      const now = Date.now();
      let filtered = raw
        .filter(e => e.visibility === 'public')
        .filter(e => {
          const cleanTime = e.startTime.replace(/\u202F/g, ' ');
          const ts = Date.parse(`${e.date} ${cleanTime}`);
          return !isNaN(ts) && ts >= now;
        });

      if (debouncedTerm.trim()) {
        const q = debouncedTerm.toLowerCase();
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
        borderColor:    isDark ? '#333' : '#ccc'
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
            No upcoming events.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
            {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
            <Text style={[styles.title, { color: textColor }]}>{item.title}</Text>
            <Text style={{ color: textColor }}>
              {item.date} •{' '}
              {new Date(`${item.date} ${item.startTime.replace(/\u202F/g,' ')}`)
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
