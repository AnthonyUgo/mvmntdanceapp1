import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image, StyleSheet
} from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ThemeContext } from '../contexts/ThemedContext';
import { API_BASE_URL } from '@env';
import type { RootStackParamList } from '../../App';
import type { RouteProp } from '@react-navigation/native';

type AllEventsScreenRouteProp = RouteProp<RootStackParamList, 'AllEventsScreen'>;

interface Event {
  id: string;
  title: string;
  image: string;
}

const AllEventsScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#121212' : '#fff';
  const textColor = isDark ? '#fff' : '#000';

  const route = useRoute<AllEventsScreenRouteProp>();
  const { username } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/events?organizerId=${username}`);
        setEvents(res.data.events || []);
      } catch (err) {
        console.error('Failed to fetch all events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [username]);

  const renderItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventInfo', { eventId: item.id, organizerId: username })}
    >
      <Image source={{ uri: item.image }} style={styles.eventImage} />
      <Text style={[styles.eventTitle, { color: textColor }]} numberOfLines={1}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.header, { color: textColor }]}>All Events by {username}</Text>
      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 16 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  eventCard: {
    width: '31%',
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
  },
  eventImage: { width: '100%', height: 100, borderRadius: 10 },
  eventTitle: { marginTop: 4, fontSize: 14, fontWeight: '500' },
});

export default AllEventsScreen;
