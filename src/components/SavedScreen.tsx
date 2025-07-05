import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../contexts/ThemedContext';
import { getPublicEvents } from '../api';
import EventCard from '../components/EventCard'; // same one as Discover

const SAVED_EVENTS_KEY = 'savedEvents';

const SavedScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [savedEvents, setSavedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSavedEvents = async () => {
    try {
      const raw = await AsyncStorage.getItem(SAVED_EVENTS_KEY);
      const savedIds: string[] = raw ? JSON.parse(raw) : [];

      const { events } = await getPublicEvents(); // pull all public events
      const saved = events.filter((e: any) => savedIds.includes(e.id));
      setSavedEvents(saved);
    } catch (err) {
      console.error('Failed to load saved events:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSavedEvents();
  }, []);

  if (loading) {
    return (
      <View style={[s.container, { backgroundColor: isDark ? '#121212' : '#fff' }]}>
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
      </View>
    );
  }

  return (
    <View style={[s.container, { backgroundColor: isDark ? '#121212' : '#fff' }]}>
      <FlatList
        data={savedEvents}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadSavedEvents} />
        }
        ListEmptyComponent={
          <Text style={[s.text, { color: isDark ? '#ccc' : '#666' }]}>
            You haven’t saved any events yet.
          </Text>
        }
        contentContainerStyle={savedEvents.length === 0 ? s.center : { padding: 16 }}
        renderItem={({ item }) => (
          <EventCard
            id={item.id}
            title={item.title}
            date={item.date}
            startTime={item.startTime}
            venueName={item.venueName}
            image={item.image}
            price={
              item.price && item.price !== 'Free'
                ? `$${parseFloat(item.price).toFixed(2)}`
                : 'Free'
            }
            saved={true}
            onPress={() => {}} // optional: navigate to event info
            onSaveToggle={loadSavedEvents} // refresh on toggle
          />
        )}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  text: { fontSize: 16, textAlign: 'center' },
});

export default SavedScreen;
