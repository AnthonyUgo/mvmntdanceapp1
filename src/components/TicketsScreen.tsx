import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../contexts/ThemedContext';
import { Ionicons } from '@expo/vector-icons';

type TicketEvent = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  tickets: { email: string; purchased: boolean }[];
  quantity: number;
};

const API_URL = 'https://muvs-backend-abc-e5hse4csf6dhajfy.canadacentral-01.azurewebsites.net/api/events/tickets';

const TicketsScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const bgColor = theme === 'dark' ? '#121212' : '#fff';

  const [tickets, setTickets] = useState<TicketEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to format "HH:mm" → "h:mm AM/PM"
  const formatTime12h = (time24: string): string => {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  useEffect(() => {
    (async () => {
      const email = await AsyncStorage.getItem('userEmail');
      if (!email) return setLoading(false);

      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        if (res.ok) {
          const { events } = await res.json();
          setTickets(events);
        } else {
          console.warn('Failed to fetch tickets');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={textColor} />
      </View>
    );
  }

  if (tickets.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: bgColor }]}>
        <Text style={[styles.header, { color: textColor }]}>Your Tickets</Text>
        <Text style={{ color: textColor }}>You don’t have any tickets yet.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.header, { color: textColor }]}>Your Tickets</Text>

      <FlatList
        data={tickets}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          // count how many tickets this user purchased
          const count = item.tickets.filter(t => t.purchased).length;
          return (
            <TouchableOpacity style={[styles.card, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.title, { color: textColor }]}>{item.title}</Text>
                <Ionicons name="ticket-outline" size={20} color={textColor} />
              </View>
              <Text style={{ color: textColor, marginBottom: 4 }}>
                {item.date} • {formatTime12h(item.startTime)} – {formatTime12h(item.endTime)}
              </Text>
              <Text style={{ color: textColor }}>
                You purchased {count} / {item.quantity} tickets
              </Text>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '600' },
});

export default TicketsScreen;
