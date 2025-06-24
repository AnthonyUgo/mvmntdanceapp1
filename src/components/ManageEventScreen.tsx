import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemedContext';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import { KeyboardTypeOptions } from 'react-native';

type RootStackParamList = {
  ManageEvent: { eventId: string; isCollaborator?: boolean };
};

type RouteProps = RouteProp<RootStackParamList, 'ManageEvent'>;
type EventType = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: {
    name: string;
    address: string;
  };
  quantity: number;
  ticketPrice: number;
  collaborator?: string;
  image?: string;
  tickets?: any[];
  draft?: boolean;
};


const API_URL = 'https://3888-2605-ad80-90-c057-d1a2-a756-d240-92fe.ngrok-free.app/api/events';

const ManageEventScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const { eventId, isCollaborator } = route.params;
  const { theme } = useContext(ThemeContext);

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState<string | null>(null);

  const backgroundColor = theme === 'dark' ? '#121212' : '#fff';
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const accentColor = '#4285F4';

  useEffect(() => {
    fetch(`${API_URL}/${eventId}`)
      .then(res => res.json())
      .then(data => {
        setEvent(data);
        setImage(data.image || null);
      })
      .catch(() => Alert.alert('Error', 'Failed to load event'))
      .finally(() => setLoading(false));
  }, [eventId]);

  const pickImage = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      setEvent((prev: EventType) => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_URL}/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      if (res.ok) {
        Alert.alert('Saved', 'Event updated successfully!');
      } else {
        throw new Error('Save failed');
      }
    } catch {
      Alert.alert('Error', 'Failed to save event');
    }
  };

  const renderInput = (
  label: string,
  value: string,
  onChange: (text: string) => void,
  keyboardType: KeyboardTypeOptions = 'default'
) => (
  <TextInput
    style={[styles.input, { color: textColor, borderColor: accentColor }]}
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
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={{ color: textColor }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Manage Event</Text>

      <TouchableOpacity onPress={pickImage} disabled={isCollaborator} style={styles.imageBox}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Ionicons name="camera-outline" size={60} color={accentColor} />
        )}
      </TouchableOpacity>

      {renderInput('Event Title', event.title, (text) => setEvent({ ...event, title: text }))}
      {renderInput('Date', event.date, (text) => setEvent({ ...event, date: text }))}
      {renderInput('Start Time', event.startTime, (text) => setEvent({ ...event, startTime: text }))}
      {renderInput('End Time', event.endTime, (text) => setEvent({ ...event, endTime: text }))}
      {renderInput('Venue Name', event.venue?.name || '', (text) => setEvent({ ...event, venue: { ...event.venue, name: text } }))}
      {renderInput('Venue Address', event.venue?.address || '', (text) => setEvent({ ...event, venue: { ...event.venue, address: text } }))}
      {renderInput('Ticket Quantity', String(event.quantity), (text) => setEvent({ ...event, quantity: parseInt(text) || 0 }), 'number-pad')}
      {renderInput('Ticket Price', String(event.price), (text) => setEvent({ ...event, price: parseFloat(text) || 0 }), 'decimal-pad')}
      {renderInput('Collaborator Email', event.collaborator || '', (text) => setEvent({ ...event, collaborator: text }), 'email-address')}

      {!isCollaborator && (
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: accentColor }]} onPress={handleSave}>
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      )}

      {/* Chat Section */}
      {event.tickets?.length > 0 && (
        <View style={styles.chatBox}>
          <Text style={[styles.chatTitle, { color: textColor }]}>Event Chat</Text>
          <Text style={{ color: '#999', marginBottom: 8 }}>👀 Chat UI will load here...</Text>
          {/* TODO: Add chat component with text, emoji, GIF (organizer can send links) */}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  imageBox: {
    height: 180, borderWidth: 1, borderRadius: 8, marginBottom: 16,
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
  },
  image: { width: '100%', height: '100%' },
  input: {
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 16,
    paddingVertical: 12, marginBottom: 16, fontSize: 16
  },
  saveButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 8, marginTop: 10
  },
  saveText: { color: '#fff', marginLeft: 8, fontSize: 16, fontWeight: '600' },
  chatBox: {
    marginTop: 30, padding: 16, backgroundColor: '#1e1e1e',
    borderRadius: 12
  },
  chatTitle: {
    fontSize: 18, fontWeight: '600', marginBottom: 8
  }
});

export default ManageEventScreen;
