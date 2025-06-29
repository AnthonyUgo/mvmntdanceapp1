// src/screens/MyEventsScreen.tsx
import React, { useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemedContext';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

const API_URL =
  'https://muvs-backend-abc-e5hse4csf6dhajfy.canadacentral-01.azurewebsites.net/api/events';

type Event = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  draft: boolean;
  quantity: number;
  tickets?: { purchased: boolean }[];
  venue: { name: string; address: string };
};

const MyEventsScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'MyEvents'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'MyEvents'>>();
  const initialTab = route.params?.initialTab || 'live';

  const [events, setEvents]         = useState<Event[]>([]);
  const [search, setSearch]         = useState('');
  const [activeTab, setActiveTab]   = useState<'live' | 'past' | 'drafts'>(initialTab);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const now = Date.now();
  const textColor       = theme === 'dark' ? '#fff' : '#000';
  const backgroundColor = theme === 'dark' ? '#121212' : '#f9f9f9';
  const accentColor     = '#4285F4';

  const formatTime12h = (time24: string): string => {
    const [hStr, mStr] = (time24 || '00:00').split(':');
    let hh = parseInt(hStr, 10);
    const mm = parseInt(mStr, 10);
    if (isNaN(hh) || isNaN(mm)) return '';
    const ampm = hh >= 12 ? 'PM' : 'AM';
    hh = hh % 12 || 12;
    return `${hh}:${mm.toString().padStart(2, '0')} ${ampm}`;
  };

  const fetchEvents = async () => {
    try {
      const organizerId = await AsyncStorage.getItem('organizerUsername');
      if (!organizerId) return;

      const resp = await fetch(
        `${API_URL}?organizerId=${organizerId}&_=${Date.now()}`,
        { headers: { 'Cache-Control': 'no-cache' } }
      );
      if (!resp.ok) {
        console.warn('Failed to fetch events');
        return;
      }

      const data = await resp.json();
      // Normalize to array
      const raw: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data.events)
        ? data.events
        : [];

      // Normalize times & structure
      const normalize = (time: string) => {
        if (!time) return '00:00';
        const t = new Date(`1970-01-01T${time}`);
        return isNaN(t.getTime())
          ? '00:00'
          : t.toISOString().substr(11, 5);
      };

      const normalized: Event[] = raw.map((e: any) => ({
        id:          e.id,
        title:       e.title,
        date:        e.date || '1970-01-01',
        startTime:   normalize(e.startTime),
        endTime:     normalize(e.endTime),
        draft:       e.draft ?? false,
        quantity:    e.quantity ?? 0,
        tickets:     Array.isArray(e.tickets) ? e.tickets : [],
        venue:       e.venue || { name: e.venueName || '', address: e.venueAddress || '' },
      }));

      // Sort chronologically
      normalized.sort((a, b) =>
        new Date(`${a.date}T${a.startTime}`).getTime() -
        new Date(`${b.date}T${b.startTime}`).getTime()
      );

      setEvents(normalized);
    } catch (err) {
      console.error('❌ Failed to load events:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchEvents();
      setActiveTab(route.params?.initialTab || 'live');
    }, [route.params?.initialTab])
  );

  const handleDeleteDraft = (id: string) => {
    Alert.alert('Delete Draft', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setEvents(ev => ev.filter(e => e.id !== id)),
      },
    ]);
  };

  // Filter & search
  const filtered = events
    .filter(e => {
      const start = new Date(`${e.date}T${e.startTime}`).getTime();
      const end   = new Date(`${e.date}T${e.endTime}`).getTime();
      if (activeTab === 'live')   return !e.draft && end >= now;
      if (activeTab === 'past')   return !e.draft && end < now;
      if (activeTab === 'drafts') return e.draft;
      return false;
    })
    .filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

  const getCountdown = (e: Event) => {
    const start = new Date(`${e.date}T${e.startTime}`).getTime();
    const nowMs = Date.now();
    if (nowMs >= start && nowMs <= new Date(`${e.date}T${e.endTime}`).getTime()) {
      return <Text style={styles.liveLabel}>NOW</Text>;
    }
    const diff = start - nowMs;
    if (diff <= 0) return null;
    const days = Math.floor(diff / 86400000);
    const hrs  = Math.floor(diff / 3600000) % 24;
    return <Text style={styles.countdown}>{days > 0 ? `${days}d` : `${hrs}h`}</Text>;
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textColor }]}>My Events</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateEvent')}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchBar, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
        <Ionicons name="search-outline" size={20} color={accentColor} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search events…"
          placeholderTextColor={theme === 'dark' ? '#888' : '#666'}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.tabContainer}>
        {(['live', 'past', 'drafts'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && { borderBottomColor: accentColor }]}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? accentColor : textColor }]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={accentColor} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchEvents(); }} />
          }
          ListEmptyComponent={
            <Text style={{ color: textColor, textAlign: 'center', marginTop: 20 }}>
              No events found.
            </Text>
          }
          renderItem={({ item }) => {
            const sold = (item.tickets || []).filter(t => t.purchased).length;
            return (
              <TouchableOpacity
                onPress={() => navigation.navigate('ManageEvent', { eventId: item.id, isCollaborator: false })}
                onLongPress={() => item.draft && handleDeleteDraft(item.id)}
              >
                <View style={[styles.card, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.title, { color: textColor }]}>{item.title}</Text>
                    {getCountdown(item)}
                  </View>
                  <Text style={{ color: textColor, fontSize: 12 }}>
                    {item.date} • {formatTime12h(item.startTime)} – {formatTime12h(item.endTime)}
                  </Text>
                  <Text style={{ color: accentColor, fontSize: 12, marginVertical: 4 }}>
                    {sold}/{item.quantity} tickets sold
                  </Text>
                  {item.venue.name && (
                    <View style={styles.venueChip}>
                      <Ionicons name="location-outline" size={14} color="#fff" />
                      <Text style={styles.venueText}>{item.venue.name}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

export default MyEventsScreen;

const styles = StyleSheet.create({
  container:   { flex: 1 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  addButton:   { backgroundColor: '#4285F4', borderRadius: 24, padding: 8 },
  searchBar:   { flexDirection: 'row', alignItems: 'center', margin: 16, paddingHorizontal: 12, paddingVertical: 14, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 18 },
  tabContainer:{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ccc' },
  tab:         { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText:     { fontSize: 16, fontWeight: '600' },
  card:        { margin: 16, padding: 16, borderRadius: 12, elevation: 2 },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title:       { fontSize: 18, fontWeight: '600', flex: 1 },
  countdown:   { backgroundColor: '#ddd', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 12 },
  liveLabel:   { backgroundColor: '#00C853', color: '#fff', padding: 4, borderRadius: 6, fontSize: 12 },
  venueChip:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4285F4', borderRadius: 6, padding: 6, marginTop: 8 },
  venueText:   { color: '#fff', marginLeft: 4 },
});
