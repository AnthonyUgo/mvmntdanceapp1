// src/components/DiscoverScreen.tsx
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Linking,
  Alert,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemedContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPublicEvents } from '../api';
import EventCard from '../components/EventCard'; // adjust path if needed

const SAVED_EVENTS_KEY = 'savedEvents';
   

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
  organizerId: string; //
};

const DiscoverScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const textColor = isDark ? '#fff' : '#000';
  const bgColor = isDark ? '#121212' : '#fff';
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);

  // Debounce the searchTerm by 500ms
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedTerm(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchEvents();
  }, [debouncedTerm]);

  function convertTo24Hour(time12h: string): string {
  if (!time12h) return '00:00';
  const [time, modifier] = time12h.split(' ');
  if (!time || !modifier) return time12h; // already in 24h

  let [hours, minutes] = time.split(':');
  if (modifier === 'PM' && hours !== '12') {
    hours = String(Number(hours) + 12);
  } else if (modifier === 'AM' && hours === '12') {
    hours = '00';
  }
  return `${hours.padStart(2, '0')}:${minutes}`;
}

  function cleanTime(rawTime: string): string {
  return rawTime?.replace(/\u202F/g, ' ').trim(); // Replace non-breaking spaces
}
  function formatDateTime(rawDate: string, rawTime: string): string {
  try {
    const dateStr = rawDate;
    const timeStr = convertTo24Hour(cleanTime(rawTime));
    const localTime = new Date(`${dateStr}T${timeStr}`);

    if (isNaN(localTime.getTime())) return 'Invalid Date';

    const datePart = localTime.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
    const timePart = localTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `${datePart} • ${timePart}`;
  } catch {
    return 'Invalid Date';
  }
}




  const fetchEvents = async () => {
  try {
    const { events: raw } = await getPublicEvents();
    console.log('📦 Raw events:', raw);

    const now = Date.now();
    let filtered = raw
      .filter(e => e.visibility === 'public')
      .filter(e => {
        const date = e.startDate || e.date;
        const time = convertTo24Hour(e.startTime);
        const dateTimeStr = `${date}T${time}`;
        const ts = new Date(dateTimeStr).getTime();
        return !isNaN(ts) && ts >= now;
      })
      .sort((a, b) => {
        const ta = new Date(`${a.startDate || a.date}T${convertTo24Hour(a.startTime)}`).getTime();
        const tb = new Date(`${b.startDate || b.date}T${convertTo24Hour(b.startTime)}`).getTime();
        return ta - tb;
      });

    setEvents(filtered);
  } catch (err) {
    console.error('❌ Error fetching events:', err);
    Alert.alert('Error', 'Failed to load events.');
  } finally {
    setRefreshing(false);
    setLoading(false); 
  }
};


   
  const toggleSaveEvent = async (eventId: string) => {
  try {
    const raw = await AsyncStorage.getItem(SAVED_EVENTS_KEY);
    const saved: string[] = raw ? JSON.parse(raw) : [];

    let updated: string[];
    if (saved.includes(eventId)) {
      updated = saved.filter((id: string) => id !== eventId);
    } else {
      updated = [...saved, eventId];
    }

    await AsyncStorage.setItem(SAVED_EVENTS_KEY, JSON.stringify(updated));
    setSavedEventIds(updated); // update local state
  } catch (err) {
    console.error('Error toggling saved event:', err);
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
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: isDark ? '#1e1e1e' : '#f0f0f0',
            borderColor: isDark ? '#333' : '#ccc',
          },
        ]}
      >
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
        renderItem={({ item }) => {
  const formatted = formatDateTime(item.date, item.startTime);
  const [datePart, timePart] = formatted.split(' • ');

  return (
    <EventCard
      id={item.id}
      title={item.title}
      date={datePart}
      startTime={timePart}
      venueName={item.venueName}
      image={item.image ?? undefined}
      price={
        item.price && item.price !== 'Free'
          ? `$${parseFloat(item.price).toFixed(2)}`
          : 'Free'
      }
      saved={savedEventIds.includes(item.id)}
      onPress={() =>
        navigation.navigate('EventInfo', {
          eventId: item.id,
          organizerId: item.organizerId,
        })
      }
      onSaveToggle={() => toggleSaveEvent(item.id)}
    />
  );
}}
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
  searchInput: { flex: 1, marginHorizontal: 8, height: '100%' },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 12,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
});

export default DiscoverScreen;
