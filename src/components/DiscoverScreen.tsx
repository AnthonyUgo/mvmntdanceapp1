import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { ThemeContext } from '../contexts/ThemedContext';

type EventType = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  venueName: string;
  image?: string;
  price?: string;
};

const API_URL = 'https://3888-2605-ad80-90-c057-d1a2-a756-d240-92fe.ngrok-free.app/api/events/public';

const DiscoverScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const textColor = theme === 'dark' ? '#fff' : '#000';
  const bgColor = theme === 'dark' ? '#121212' : '#fff';

  const fetchEvents = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error('❌ Error fetching events:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchEvents} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
              <Text style={[styles.title, { color: textColor }]}>{item.title}</Text>
              <Text style={{ color: textColor }}>{item.date} • {item.startTime}</Text>
              <Text style={{ color: textColor }}>{item.venueName}</Text>
              <Text style={{ color: textColor }}>{item.price || 'Free'}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f4f4f4',
  },
  image: { width: '100%', height: 180 },
  title: { fontSize: 18, fontWeight: '600', marginVertical: 8 },
});

export default DiscoverScreen;
