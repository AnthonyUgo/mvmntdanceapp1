// src/components/ManageEventScreen.tsx
import 'react-native-get-random-values';
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import axios from 'axios';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemedContext';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  ManageEvent: { eventId: string; isCollaborator?: boolean };
};
type RouteProps = RouteProp<RootStackParamList, 'ManageEvent'>;

const API_URL = 'https://muvs-backend-abc-e5hse4csf6dhajfy.canadacentral-01.azurewebsites.net/api/events';

// the key under which you cache this organizer's events list
const STORAGE_KEY = 'organizerEvents'; 

const ManageEventScreen: React.FC = () => {
  const route      = useRoute<RouteProps>();
  const nav        = useNavigation();
  const { eventId, isCollaborator } = route.params;
  const { theme }  = useContext(ThemeContext);

  const [event, setEvent]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage]     = useState<string|null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [collaborators, setCollaborators] = useState<string[]>([]);

  const bg     = theme === 'dark' ? '#121212' : '#fff';
  const txt    = theme === 'dark' ? '#fff'    : '#000';
  const accent = '#4285F4';

  useEffect(() => {
    (async () => {
      const organizerId = await AsyncStorage.getItem('organizerUsername');
      if (!organizerId) {
        Alert.alert('Error', 'Not signed in as organizer');
        return setLoading(false);
      }
      try {
        const res  = await axios.get(`${API_URL}/${eventId}?organizerId=${organizerId}`);
        const data = res.data;
        setEvent({
         ...data,
         title: data.title || '',
         description: data.description || '',
         startDate: data.startDate || data.date || '',
         endDate: data.endDate || '',
         startTime: data.startTime || '',
         endTime: data.endTime || '',
         venue: {
           name:    data.venueName    || '',
           address: data.venueAddress || '',
         },
         quantity: data.quantity ?? 0,
         price: data.price ?? '',
         image: data.image || null,
         collaborator: data.collaborator || '',
       });
        setTickets(Array.isArray(data.tickets) ? data.tickets : []);
        setVisibility(data.visibility === 'private' ? 'private' : 'public');
        setCollaborators(Array.isArray(data.collaborators) ? data.collaborators : []);
        setImage(data.image || null);
      } catch {
        Alert.alert('Error', 'Failed to load event');
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId]);

  // pick new image
  const pickImage = async () => {
    const r = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
    });
    if (!r.canceled && r.assets.length) {
      const uri = r.assets[0].uri;
      setImage(uri);
      setEvent((e: any) => ({ ...e, image: uri }));
    }
  };


  const updateTicket = (index: number, newTicket: any) => {
   const updated = [...tickets];
   updated[index] = newTicket;
   setTickets(updated);
 };

  // update AsyncStorage list
  const updateLocalList = async (updatedEvent: any) => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const list: any[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(e => e.id === eventId);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updatedEvent };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  };

  // remove from AsyncStorage list
  const removeFromLocalList = async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const list: any[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(e => e.id !== eventId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  };

  // save edits
  const handleSave = async () => {
  try {
    const organizerId = await AsyncStorage.getItem('organizerUsername');
    if (!organizerId) throw new Error('Organizer ID not found');

    const payload = {
      id: eventId,
      organizerId,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      startTime: event.startTime,
      endTime: event.endTime,
      venueName: event.venue?.name ?? '',
      venueAddress: event.venue?.address ?? '',
      price: parseFloat(event.price) || 0,
      quantity: parseInt(event.quantity) || 0,
      collaborator: event.collaborator ?? '',
      image: image,
      tickets,
      visibility,
      collaborators,
      draft: false,
    };

    const res = await axios.post(API_URL, payload);
    await updateLocalList(res.data.event);

    Alert.alert('Success', 'Event updated successfully.');
  } catch (err: any) {
    console.error('❌ Save error:', err?.response?.data || err.message || err);
    Alert.alert('Error', 'Failed to save event');
  }
};



  // delete locally (but keep in DB)
  const handleDelete = async () => {
    Alert.alert(
      'Delete from list?',
      'This will remove it from your My Events view but keep it in the database.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const organizerId = await AsyncStorage.getItem('organizerUsername');
            try {
              // hit your API's DELETE endpoint
              await fetch(
                `${API_URL}/${eventId}?organizerId=${organizerId}`,
                { method: 'DELETE' }
              );
            } catch {
              // ignore network errors here
            }
            await removeFromLocalList();
            nav.goBack();
          }
        }
      ]
    );
  };

  const renderInput = (
    label: string,
    value: string,
    onChange: (t: string) => void,
    keyboardType: any = 'default'
  ) => (
    <TextInput
      style={[styles.input, { color: txt, borderColor: accent }]}
      value={value}
      onChangeText={onChange}
      placeholder={label}
      placeholderTextColor={theme === 'dark' ? '#888' : '#666'}
      keyboardType={keyboardType}
      editable={!isCollaborator}
    />
  );

  if (loading || !event) {
    return (
      <View style={[styles.container, { backgroundColor: bg }]}>
        <Text style={{ color: txt }}>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.title, { color: txt }]}>Manage Event</Text>

      <TouchableOpacity
        onPress={pickImage}
        disabled={isCollaborator}
        style={styles.imageBox}
      >
        {image
          ? <Image source={{ uri: image }} style={styles.image} />
          : <Ionicons name="camera-outline" size={60} color={accent} />}
      </TouchableOpacity>

      {renderInput('Title',       event.title,     t => setEvent({ ...event, title: t }))}
      {renderInput('Description', event.description || '', t => setEvent({ ...event, description: t }))}
      {renderInput('Start Date', event.startDate || '', t => setEvent({ ...event, startDate: t }))}
      {renderInput('End Date', event.endDate || '', t => setEvent({ ...event, endDate: t }))}
      {renderInput('Start Time',  event.startTime, t => setEvent({ ...event, startTime: t }))}
      {renderInput('End Time',    event.endTime,   t => setEvent({ ...event, endTime: t }))}
      {renderInput(
        'Venue Name',
        event.venue?.name  ?? '',
        t => setEvent({ ...event, venue: { ...event.venue, name: t }})
      )}
      {renderInput(
        'Venue Address',
        event.venue?.address  ?? '',
        t => setEvent({ ...event, venue: { ...event.venue, address: t }})
      )}
      {renderInput(
        'Quantity',
        String(event.quantity),
        t => setEvent({ ...event, quantity: parseInt(t, 10) || 0 }),
        'number-pad'
      )}
      {renderInput(
        'Price',
        String(event.price),
        t => setEvent({ ...event, price: parseFloat(t) || 0 }),
        'decimal-pad'
      )}
      {renderInput(
        'Collaborator',
        event.collaborator || '',
        t => setEvent({ ...event, collaborator: t })
      )}

      {renderInput(
        'Collaborators (comma separated)',
         collaborators.join(', '),
         t => setCollaborators(t.split(',').map(s => s.trim()))
      )}

       {/* Visibility Toggle */}
     <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
       <Text style={{ color: txt, fontSize: 16, marginRight: 12 }}>Private Event?</Text>
        <TouchableOpacity
         onPress={() => setVisibility(visibility === 'private' ? 'public' : 'private')}
         style={{
           backgroundColor: visibility === 'private' ? '#a259ff' : '#ccc',
           paddingHorizontal: 12,
           paddingVertical: 6,
           borderRadius: 20,
         }}
         >
        <Text style={{ color: '#fff' }}>
      {visibility === 'private' ? 'Private' : 'Public'}
     </Text>
   </TouchableOpacity>
</View>

     {/* Ticket List */}
<Text style={{ color: txt, fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Tickets</Text>
{tickets.map((ticket, i) => (
  <View key={i} style={{ marginBottom: 12 }}>
    {renderInput('Name', ticket.name, t => updateTicket(i, { ...ticket, name: t }))}
    {renderInput('Price', String(ticket.price), t => updateTicket(i, { ...ticket, price: parseFloat(t) }), 'decimal-pad')}
    {renderInput('Quantity', String(ticket.qty), t => updateTicket(i, { ...ticket, qty: parseInt(t) || 0 }), 'number-pad')}
    {renderInput('Time Limit', ticket.timeLimit || '', t => updateTicket(i, { ...ticket, timeLimit: t }))}
  </View>
))}


      {/* Save + Delete buttons */}
      <View style={styles.buttonRow}>
        {!isCollaborator && (
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: accent }]}
            onPress={handleSave}
          >
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.deleteButton]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.saveText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container:   { flex: 1, padding: 20 },
  title:       { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  imageBox:    {
    height: 180,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image:       { width: '100%', height: '100%' },
  input:       {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  buttonRow:   { flexDirection: 'row', justifyContent: 'space-between' },
  saveButton:  {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginRight: 8,
  },
  deleteButton:{
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d9534f',
    paddingVertical: 14,
    borderRadius: 8,
  },
  saveText:    { color: '#fff', marginLeft: 8, fontSize: 16, fontWeight: '600' },
});

export default ManageEventScreen;
