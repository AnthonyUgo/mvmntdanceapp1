import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemedContext';
import { RouteProp, useRoute } from '@react-navigation/native';

// Dummy data lookup
const dummyEvents = [
  {
    id: '1',
    title: 'Dance With OMGitsBjorn',
    image: '',
    date: '2025-06-09',
    price: '20.00',
    quantity: 50,
    collaborator: 'teacher@example.com',
    draft: false,
  },
  // Add more if needed
];

type ManageEventScreenRouteProp = RouteProp<{ params: { eventId: string, isCollaborator?: boolean } }, 'params'>;

const ManageEventScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const route = useRoute<ManageEventScreenRouteProp>();
  const { eventId, isCollaborator } = route.params;

  const [event, setEvent] = useState<any | null>(null);

  const backgroundColor = theme === 'dark' ? '#121212' : '#fff';
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const accentColor = '#4285F4';

  useEffect(() => {
    // Simulate fetch event data
    const foundEvent = dummyEvents.find(e => e.id === eventId);
    if (foundEvent) {
      setEvent(foundEvent);
    } else {
      Alert.alert('Error', 'Event not found');
    }
  }, [eventId]);

  const handleSave = () => {
    Alert.alert('Save', 'Event changes saved!');
    // TODO: Save to backend
  };

  const handleDelete = () => {
    Alert.alert('Delete', 'Event deleted!');
    // TODO: Delete from backend
  };

  if (!event) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={{ color: textColor }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Manage Event</Text>

      {/* Event Image Placeholder */}
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => Alert.alert('Edit Image', 'Image picker coming soon!')}
        disabled={isCollaborator}
      >
        {event.image ? (
          <Image source={{ uri: event.image }} style={styles.image} />
        ) : (
          <Ionicons name="camera-outline" size={60} color={accentColor} />
        )}
      </TouchableOpacity>

      {/* Event Name */}
      <TextInput
        style={[styles.input, { color: textColor, borderColor: accentColor }]}
        value={event.title}
        onChangeText={(text) => setEvent({ ...event, title: text })}
        placeholder="Event Name"
        placeholderTextColor={theme === 'dark' ? '#888' : '#666'}
        editable={!isCollaborator}
      />

      {/* Event Date */}
      <TextInput
        style={[styles.input, { color: textColor, borderColor: accentColor }]}
        value={event.date}
        onChangeText={(text) => setEvent({ ...event, date: text })}
        placeholder="Event Date"
        placeholderTextColor={theme === 'dark' ? '#888' : '#666'}
        editable={!isCollaborator}
      />

      {/* Ticket Price */}
      <TextInput
        style={[styles.input, { color: textColor, borderColor: accentColor }]}
        value={event.price}
        onChangeText={(text) => setEvent({ ...event, price: text })}
        placeholder="Ticket Price"
        placeholderTextColor={theme === 'dark' ? '#888' : '#666'}
        keyboardType="decimal-pad"
        editable={!isCollaborator}
      />

      {/* Quantity */}
      <TextInput
        style={[styles.input, { color: textColor, borderColor: accentColor }]}
        value={event.quantity.toString()}
        onChangeText={(text) => setEvent({ ...event, quantity: parseInt(text) || 0 })}
        placeholder="Quantity"
        placeholderTextColor={theme === 'dark' ? '#888' : '#666'}
        keyboardType="number-pad"
        editable={!isCollaborator}
      />

      {/* Collaborator */}
      <TextInput
        style={[styles.input, { color: textColor, borderColor: accentColor }]}
        value={event.collaborator}
        onChangeText={(text) => setEvent({ ...event, collaborator: text })}
        placeholder="Collaborator Email"
        placeholderTextColor={theme === 'dark' ? '#888' : '#666'}
        keyboardType="email-address"
        editable={!isCollaborator}
      />

      {/* Action Buttons */}
      {!isCollaborator && (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: accentColor }]} onPress={handleSave}>
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.deleteButton, { borderColor: 'red' }]} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="red" />
            <Text style={[styles.buttonText, { color: 'red' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {isCollaborator && (
        <Text style={[styles.collabNote, { color: textColor }]}>
          You have view-only access and can edit only event details (not price or deletion).
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  imageContainer: {
    height: 180,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: { width: '100%', height: '100%', borderRadius: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginRight: 8
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginLeft: 8
  },
  buttonText: { fontSize: 16, marginLeft: 8, color: '#fff' },
  collabNote: { marginTop: 20, fontStyle: 'italic' }
});

export default ManageEventScreen;
