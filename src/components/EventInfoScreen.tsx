import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../contexts/ThemedContext';
import { Modal, FlatList } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { API_BASE_URL } from '@env';



interface RouteParams {
  eventId: string;
  organizerId: string;
}

const EventInfoScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const textColor = isDark ? '#fff' : '#000';
  const bgColor = isDark ? '#121212' : '#fff';

  
  const route = useRoute();
  const { eventId, organizerId } = route.params as RouteParams;
  const [ticketModalVisible, setTicketModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [event, setEvent] = useState<any>(null);
  const [organizer, setOrganizer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        const userRes =  await axios.get(`${API_BASE_URL}/api/users/get?email=${email}`);
        const username = userRes.data.user.username;
        setCurrentUsername(username);

        const eventRes = await axios.get(`${API_BASE_URL}/api/events/${eventId}?organizerId=${organizerId}`);
        setEvent(eventRes.data);
        console.log('🧾 Tickets:', eventRes.data.tickets);


        const organizerRes = await axios.get(`${API_BASE_URL}/api/users/by-username?username=${eventRes.data.organizerId}`);
        setOrganizer(organizerRes.data.user);
      } catch (err) {
        console.error('❌ Error loading event:', err);
        Alert.alert('Error', 'Unable to load event details.');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, []);
  

  if (loading || !event) {
    return (
      <View style={[styles.center, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={textColor} />
      </View>
    );
  }

  return (
  <>
    <ScrollView style={{ backgroundColor: bgColor }} contentContainerStyle={{ paddingBottom: 120 }}>
      {event.image && <Image source={{ uri: event.image }} style={styles.image} />}

      <View style={{ padding: 16 }}>
        <Text style={[styles.title, { color: textColor }]}>{event.title}</Text>
        <Text style={[styles.subtitle, { color: textColor }]}>
          {event.venueName} • {event.venueAddress}
        </Text>
        <Text style={[styles.subtitle, { color: textColor, marginTop: 4 }]}>
          {event.startDate} at {event.startTime}
        </Text>

        <View style={{ marginTop: 20 }}>
          <Text style={[styles.sectionHeader, { color: textColor }]}>Overview</Text>
          <Text style={[styles.paragraph, { color: textColor }]}>{event.description}</Text>
        </View>

        {organizer && (
          <View style={{ marginTop: 28 }}>
            <Text style={[styles.sectionHeader, { color: textColor }]}>Organized by</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('OrganizerPublicProfile', { username: organizer.username })}
              style={styles.organizerRow}
            >
              <Image source={{ uri: organizer.profileImage }} style={styles.organizerAvatar} />
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.organizerName, { color: textColor }]}>{organizer.username}</Text>
                <Text style={{ color: isDark ? '#ccc' : '#666' }}>
                  Followers {organizer.followers?.length ?? 0}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>

    {/* Manage Event Button */}
    {currentUsername === event.organizerId && (
      <TouchableOpacity
        style={styles.manageButton}
        onPress={() => navigation.navigate('ManageEvent', { eventId })}
      >
        <Text style={styles.manageText}>Manage Event</Text>
      </TouchableOpacity>
    )}

    {/* Buy Ticket Button */}
    {event.tickets?.length > 0 && (
      <TouchableOpacity
        style={[styles.manageButton, {
          backgroundColor: '#28a745',
          bottom: currentUsername === event.organizerId ? 80 : 16
        }]}
        onPress={() => setTicketModalVisible(true)}
      >
        <Text style={styles.manageText}>Buy Ticket</Text>
      </TouchableOpacity>
    )}

    {/* Ticket Modal */}
    <Modal visible={ticketModalVisible} animationType="slide" transparent={true}>
      <View style={[styles.modalContainer, { backgroundColor: bgColor }]}>
        <Text style={[styles.modalTitle, { color: textColor }]}>Select a Ticket</Text>
        <FlatList
          data={event.tickets}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.ticketOption}
              onPress={() => setSelectedTicket(item)}
            >
              <Text style={[styles.ticketTitle, { color: textColor }]}>{item.name}</Text>
              <Text style={{ color: isDark ? '#ccc' : '#666' }}>
                ${item.price} • Qty: {item.qty}
              </Text>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity
          style={styles.purchaseButton}
          onPress={() => {
            setTicketModalVisible(false);
            navigation.navigate('Checkout', {
              eventId: event.id,
              ticket: selectedTicket,
            });
          }}
          disabled={!selectedTicket}
        >
          <Text style={styles.purchaseButtonText}>
            {selectedTicket ? `Purchase ${selectedTicket.name}` : 'Select a Ticket'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setTicketModalVisible(false)} style={styles.closeModalButton}>
          <Text style={styles.manageText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  </>
);
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 220 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 16, marginTop: 2 },
  sectionHeader: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  paragraph: { fontSize: 15, marginTop: 8, lineHeight: 22 },
  organizerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  organizerAvatar: { width: 50, height: 50, borderRadius: 25 },
  organizerName: { fontSize: 16, fontWeight: '500' },
  manageButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#a259ff',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalContainer: {
  flex: 1,
  marginTop: '30%',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  padding: 16,
},
modalTitle: {
  fontSize: 20,
  fontWeight: '600',
  marginBottom: 12,
},
ticketOption: {
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: '#ccc',
},
ticketTitle: {
  fontSize: 16,
  fontWeight: '500',
},
purchaseButton: {
  backgroundColor: '#28a745',
  padding: 12,
  borderRadius: 8,
  marginTop: 16,
  alignItems: 'center',
},
purchaseButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},
closeModalButton: {
  marginTop: 12,
  padding: 10,
  alignItems: 'center'
},
  manageText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default EventInfoScreen;
