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
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemedContext';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

// Define Event type
const API_URL = 'https://a85e-2605-ad80-90-c057-7ddd-6861-9988-a3a6.ngrok-free.app/api/events';

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
  venueName?: string;
  venueAddress?: string;
};

const MyEventsScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'MyEvents'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'MyEvents'>>();
  const initialTab = route.params?.initialTab || 'live';

  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'live' | 'past' | 'drafts'>(initialTab);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const formatTime12h = (time24: string): string => {
    if (!time24) return '';
    const [hStr, mStr] = time24.split(':');
    let hh = parseInt(hStr, 10);
    const mm = parseInt(mStr, 10);
    if (isNaN(hh) || isNaN(mm)) return '';
    const ampm = hh >= 12 ? 'PM' : 'AM';
    hh = hh % 12 || 12;
    const minutes = mm.toString().padStart(2, '0');
    return `${hh}:${minutes} ${ampm}`;
  };

  const now = new Date();
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const backgroundColor = theme === 'dark' ? '#121212' : '#f9f9f9';
  const accentColor = '#4285F4';

  const fetchEvents = async () => {
    try {
      const organizerId = await AsyncStorage.getItem('organizerUsername');
      if (!organizerId) {
        console.warn('Organizer ID not found');
        return;
      }

      const response = await fetch(`${API_URL}?organizerId=${organizerId}&_=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!response.ok) {
        console.warn('Failed to fetch events');
        return;
      }

      // ➊ parse
      const data = await response.json();
      // ➋ normalize to an array
      const rawEventsArray: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data.events)
          ? data.events
          : [];

      const normalizeTime = (time: string): string => {
        if (!time) return '00:00';
        try {
          const t24 = new Date(`1970-01-01T${time}`);
          if (!isNaN(t24.getTime())) {
            return time.length === 5 ? time : t24.toISOString().substr(11, 5);
          }
          const t12 = new Date(`1970-01-01 ${time}`);
          if (!isNaN(t12.getTime())) {
            return t12.toISOString().substr(11, 5);
          }
        } catch {
          console.warn('⛔ Bad time format:', time);
        }
        return '00:00';
      };

      // ➌ map + normalize each
      const normalized: Event[] = rawEventsArray.map((e: any) => {
        const safeDate  = e.date || '1970-01-01';
        const safeStart = normalizeTime(e.startTime);
        const safeEnd   = normalizeTime(e.endTime);
        if (!e.date || !e.startTime || !e.endTime) {
          console.warn('❗ Skipping invalid event:', e);
        }
        return {
          ...e,
          date:      safeDate,
          startTime: safeStart,
          endTime:   safeEnd,
          draft:     e.draft ?? false,
          venue:     e.venue || { name: e.venueName || '', address: e.venueAddress || '' }
        };
      });

      // ➍ sort by date/time
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

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchEvents();
    setActiveTab(route.params?.initialTab || 'live');
  }, [route.params?.initialTab]));

  const handleDeleteDraft = (eventId: string) => {
    Alert.alert('Delete Draft', 'Are you sure you want to delete this draft?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setEvents(prev => prev.filter(e => e.id !== eventId))
      }
    ]);
  };

  const filteredEvents = events
    .filter(e => {
      const start = new Date(`${e.date}T${e.startTime || '00:00'}`);
      const end   = new Date(`${e.date}T${e.endTime || '23:59'}`);
      if (activeTab === 'live')   return !e.draft && end >= now;
      if (activeTab === 'past')   return !e.draft && end < now;
      if (activeTab === 'drafts') return e.draft;
      return false;
    })
    .filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

  const getCountdownLabel = (event: Event) => {
    const start = new Date(`${event.date}T${event.startTime}`);
    const end   = new Date(`${event.date}T${event.endTime}`);
    if (now >= start && now <= end) return <Text style={styles.liveLabel}>NOW</Text>;
    const diff = start.getTime() - now.getTime();
    if (diff <= 0) return null;
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000) % 24;
    return <Text style={styles.countdown}>{days > 0 ? `${days}d` : `${hours}h`}</Text>;
  };

  const handleManageEvent = (event: Event) => {
    navigation.navigate('ManageEvent', { eventId: event.id, isCollaborator: false });
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
          placeholder="Search for events..."
          placeholderTextColor={theme === 'dark' ? '#888' : '#666'}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.tabContainer}>
        {['live', 'past', 'drafts'].map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab as any)}
            style={[styles.tab, activeTab === tab && { borderBottomColor: accentColor }]}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? accentColor : textColor }]}>
              {tab[0].toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={accentColor} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchEvents(); }}
            />
          }
          renderItem={({ item }) => {
            const mapLink =
              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.venue.address)}`;
            return (
              <TouchableOpacity
                onPress={() => handleManageEvent(item)}
                onLongPress={() => item.draft && handleDeleteDraft(item.id)}
              >
                <View style={[styles.ticketCard, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
                  <View style={styles.ticketHeader}>
                    <Text style={[styles.eventTitle, { color: textColor }]}>{item.title}</Text>
                    {getCountdownLabel(item)}
                  </View>
                  <Text style={{ color: textColor, fontSize: 12, marginBottom: 4 }}>
                    {item.date} • {formatTime12h(item.startTime)} – {formatTime12h(item.endTime)}
                  </Text>
                  <Text style={{ color: accentColor, fontSize: 12, marginBottom: 8 }}>
                    {item.tickets?.filter(t => t.purchased).length || 0}/{item.quantity} tickets sold
                  </Text>
                  {item.venue.name && item.venue.address && (
                    <TouchableOpacity
                      onPress={() => navigation.navigate('WebviewScreen', { url: mapLink })}
                    >
                      <View style={styles.venueChip}>
                        <Ionicons name="location-outline" size={14} color="#fff" />
                        <Text style={styles.venueText}>
                          {item.venue.name} • {item.venue.address}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={{ color: textColor, textAlign: 'center', marginTop: 20 }}>
              No events found.
            </Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  addButton: { backgroundColor: '#4285F4', borderRadius: 24, padding: 8 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, paddingHorizontal: 12,
    paddingVertical: 8, borderRadius: 8,
    marginBottom: 16
  },
  searchInput: { marginLeft: 8, flex: 1, fontSize: 16 },
  tabContainer: {
    flexDirection: 'row', justifyContent: 'center',
    borderBottomWidth: 1, borderColor: '#ccc'
  },
  tab: {
    paddingVertical: 12, paddingHorizontal: 24,
    borderBottomWidth: 2, borderBottomColor: 'transparent'
  },
  tabText: { fontSize: 16, fontWeight: '600' },
  ticketCard: {
    marginHorizontal: 16, marginVertical: 8,
    padding: 16, borderRadius: 12,
    borderLeftWidth: 6, borderColor: '#4285F4',
    shadowColor: '#000', shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4, elevation: 2
  },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eventTitle: { fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 8 },
  countdown: {
    backgroundColor: '#ddd', paddingHorizontal: 8,
    paddingVertical: 4, borderRadius: 6,
    fontSize: 12, color: '#000'
  },
  liveLabel: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, backgroundColor: '#00C853',
    color: '#fff', fontSize: 12, fontWeight: 'bold'
  },
  venueChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#4285F4', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 6,
    alignSelf: 'flex-start', marginTop: 4
  },
  venueText: { color: '#fff', fontSize: 12, marginLeft: 4 }
});

export default MyEventsScreen;
