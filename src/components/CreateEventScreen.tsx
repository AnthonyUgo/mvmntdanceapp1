import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard, Alert, Image, ScrollView } from 'react-native';
import { ThemeContext } from '../contexts/ThemedContext';
import { Ionicons } from '@expo/vector-icons';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import { format } from 'date-fns';

const API_URL = 'https://5167-2605-90-c057-590f-6217-b6f2-ee0a.ngrok-free.app/api/events';
 // Replace with your backend URL

const CreateEventScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const backgroundColor = theme === 'dark' ? '#121212' : '#fff';
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const accentColor = '#4285F4';

  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [eventImage, setEventImage] = useState<string | null>(null);
  const [ticketPrice, setTicketPrice] = useState('');
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');

  const pickImage = async () => {
    const result = await launchImageLibraryAsync({ mediaTypes: MediaTypeOptions.Images, allowsEditing: true, quality: 0.7 });
    if (!result.canceled && result.assets.length > 0) {
      setEventImage(result.assets[0].uri);
    }
  };

  const handleSaveDraftOrPublish = async (isDraft: boolean) => {
    Keyboard.dismiss();
    if (!eventName || !eventDate) {
      Alert.alert('Missing Info', 'Please fill all required fields.');
      return;
    }

    const eventData = {
      id: Date.now().toString(),
      title: eventName,
      date: eventDate.toISOString().split('T')[0],
      price: ticketPrice,
      quantity: ticketQuantity,
      collaborator: collaboratorEmail,
      image: eventImage,
      draft: isDraft
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      if (!response.ok) throw new Error('Failed to save event.');
      Alert.alert(isDraft ? 'Draft Saved' : 'Event Published', `Event saved successfully.`);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save event.');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Create Event</Text>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {eventImage ? (
          <Image source={{ uri: eventImage }} style={styles.eventImage} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="camera-outline" size={40} color={accentColor} />
            <Text style={{ color: accentColor }}>Add Event Image</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        style={[styles.input, { color: textColor, borderColor: accentColor }]}
        placeholder="Event Name"
        placeholderTextColor={theme === 'dark' ? '#888' : '#666'}
        value={eventName}
        onChangeText={setEventName}
      />

      <View style={[styles.datePickerContainer, { borderColor: accentColor }]}>
        <Text style={[styles.label, { color: textColor }]}>Event Date:</Text>
        <TouchableOpacity
          onPress={() => Alert.alert('Coming Soon', 'Use a custom date picker here!')}
          style={styles.datePickerDial}
        >
          <Text style={[styles.dateText, { color: textColor }]}>
            {format(eventDate, 'PPP')}
          </Text>
          <Ionicons name="chevron-down-outline" size={20} color={accentColor} />
        </TouchableOpacity>
      </View>

      <View style={[styles.inputContainer, { borderColor: accentColor }]}>
        <Text style={[styles.dollarSign, { color: textColor }]}>$</Text>
        <TextInput
          style={[styles.input, { flex: 1, color: textColor }]}
          placeholder="0.00"
          placeholderTextColor={theme === 'dark' ? '#888' : '#666'}
          value={ticketPrice}
          onChangeText={(text) => {
            const cleaned = text.replace(/[^0-9.]/g, '');
            const parts = cleaned.split('.');
            let formatted = parts[0];
            if (parts.length > 1) {
              formatted += '.' + parts[1].slice(0, 2);
            }
            setTicketPrice(formatted);
          }}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={[styles.quantityContainer, { borderColor: accentColor }]}>
        <Ionicons name="remove-circle-outline" size={28} color={accentColor} onPress={() => ticketQuantity > 1 && setTicketQuantity(ticketQuantity - 1)} />
        <Text style={[styles.quantityText, { color: textColor }]}>{ticketQuantity}</Text>
        <Ionicons name="add-circle-outline" size={28} color={accentColor} onPress={() => setTicketQuantity(ticketQuantity + 1)} />
      </View>

      <TextInput
        style={[styles.input, { color: textColor, borderColor: accentColor }]}
        placeholder="Invite Collaborator Email"
        placeholderTextColor={theme === 'dark' ? '#888' : '#666'}
        value={collaboratorEmail}
        onChangeText={setCollaboratorEmail}
        keyboardType="email-address"
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.draftButton, { borderColor: accentColor }]}
          onPress={() => handleSaveDraftOrPublish(true)}
        >
          <Ionicons name="save-outline" size={20} color={accentColor} />
          <Text style={[styles.draftText, { color: accentColor }]}>Save Draft</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.publishButton, { backgroundColor: accentColor }]}
          onPress={() => handleSaveDraftOrPublish(false)}
        >
          <Ionicons name="checkmark-outline" size={20} color="#fff" />
          <Text style={styles.publishText}>Publish</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  imagePicker: {
    height: 180,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center'
  },
  eventImage: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center' },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16
  },
  datePickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  datePickerDial: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: 16 },
  label: { marginBottom: 4, fontWeight: '600' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16
  },
  dollarSign: { fontSize: 18, marginRight: 8 },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20
  },
  quantityText: { fontSize: 18, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  draftButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, padding: 12, flex: 1, marginRight: 8 },
  draftText: { marginLeft: 8, fontSize: 16 },
  publishButton: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, padding: 12, flex: 1, marginLeft: 8 },
  publishText: { color: '#fff', fontSize: 16, marginLeft: 8 }
});

export default CreateEventScreen;