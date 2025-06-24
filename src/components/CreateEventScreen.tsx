import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback
} from 'react-native';
import { ThemeContext } from '../contexts/ThemedContext';
import { Ionicons } from '@expo/vector-icons';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import DateTimePicker from '@react-native-community/datetimepicker';

const CreateEventScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const backgroundColor = theme === 'dark' ? '#121212' : '#fff';
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const accentColor = '#4285F4';

  const [eventName, setEventName] = useState('');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [ticketPrice, setTicketPrice] = useState('');
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [eventImage, setEventImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setEventImage(result.assets[0].uri);
    }
  };

  const handleSave = async (isDraft: boolean) => {
    if (!eventName || !venueName || !venueAddress) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    const event = {
      id: Date.now().toString(),
      title: eventName,
      date: eventDate.toISOString().split('T')[0],
      venue: {
        name: venueName,
        address: venueAddress,
      },
       startTime: startDateTime.toLocaleTimeString('en-GB', {
   hour: '2-digit', minute: '2-digit', hour12: false
 }),
 endTime:   endDateTime.toLocaleTimeString('en-GB', {
   hour: '2-digit', minute: '2-digit', hour12: false
 }),
      ticketPrice,
      quantity: ticketQuantity,
      image: eventImage,
      collaborator: collaboratorEmail,
      draft: isDraft
    };

    try {
  const organizerId = await AsyncStorage.getItem('organizerUsername'); // or 'organizerId' if that's your key
  if (!organizerId) {
    Alert.alert('Error', 'Organizer not logged in.');
    return;
  }

  const payload = {
    id: Date.now().toString(),
    title: eventName,
    date: eventDate.toISOString().split('T')[0],
    startTime: startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    endTime: endDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    venueName,
    venueAddress,
    price: ticketPrice,
    quantity: ticketQuantity,
    collaborator: collaboratorEmail,
    image: eventImage,
    draft: isDraft,
    tickets: [],
    organizerId // required for partition key
  };

  const response = await fetch('https://3888-2605-ad80-90-c057-d1a2-a756-d240-92fe.ngrok-free.app/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (response.ok) {
    Alert.alert('Success', `Event ${isDraft ? 'saved as draft' : 'published'} successfully.`);
    navigation.navigate('MyEvents', {
      initialTab: isDraft ? 'drafts' : 'live'
    });
  } else {
    const { error } = await response.json();
    Alert.alert('Error', error || 'Something went wrong while saving.');
  }
} catch (err) {
  console.error('❌ Save Error:', err);
  Alert.alert('Error', 'Something went wrong while saving.');
}

  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]}> 
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

          <TextInput style={[styles.input, { color: textColor, borderColor: accentColor }]} placeholder="Event Name" placeholderTextColor="#888" value={eventName} onChangeText={setEventName} />

          {/* Date Picker */}
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.input, { justifyContent: 'center' }]}>
            <Text style={{ color: textColor }}>{eventDate.toDateString()} (Tap to Change Date)</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={eventDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setEventDate(selectedDate);
              }}
            />
          )}

          {/* Start Time Picker */}
          <TouchableOpacity onPress={() => setShowStartPicker(true)} style={[styles.input, { justifyContent: 'center' }]}>
            <Text style={{ color: textColor }}>
              {startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Tap to Set Start Time)
            </Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDateTime}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={(event, selectedTime) => {
                setShowStartPicker(false);
                if (selectedTime) setStartDateTime(selectedTime);
              }}
            />
          )}

          {/* End Time Picker */}
          <TouchableOpacity onPress={() => setShowEndPicker(true)} style={[styles.input, { justifyContent: 'center' }]}>
            <Text style={{ color: textColor }}>
              {endDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Tap to Set End Time)
            </Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endDateTime}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={(event, selectedTime) => {
                setShowEndPicker(false);
                if (selectedTime) setEndDateTime(selectedTime);
              }}
            />
          )}

          <TextInput style={[styles.input, { color: textColor, borderColor: accentColor }]} placeholder="Venue Name" placeholderTextColor="#888" value={venueName} onChangeText={setVenueName} />
          <TextInput style={[styles.input, { color: textColor, borderColor: accentColor }]} placeholder="Venue Address" placeholderTextColor="#888" value={venueAddress} onChangeText={setVenueAddress} />

          <TextInput
            style={[styles.input, { color: textColor, borderColor: accentColor }]} 
            placeholder="Ticket Price (optional)"
            placeholderTextColor="#888"
            value={ticketPrice}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9.]/g, '');
              const parts = cleaned.split('.');
              let formatted = parts[0];
              if (parts.length > 1) formatted += '.' + parts[1].slice(0, 2);
              setTicketPrice(formatted);
            }}
            keyboardType="decimal-pad"
          />

          <View style={[styles.quantityContainer, { borderColor: accentColor }]}> 
            <Ionicons name="remove-circle-outline" size={28} color={accentColor} onPress={() => ticketQuantity > 1 && setTicketQuantity(ticketQuantity - 1)} />
            <Text style={[styles.quantityText, { color: textColor }]}>{ticketQuantity}</Text>
            <Ionicons name="add-circle-outline" size={28} color={accentColor} onPress={() => setTicketQuantity(ticketQuantity + 1)} />
          </View>

          <TextInput
            style={[styles.input, { color: textColor, borderColor: accentColor }]} 
            placeholder="Invite Collaborator Email (optional)"
            placeholderTextColor="#888"
            value={collaboratorEmail}
            onChangeText={setCollaboratorEmail}
            keyboardType="email-address"
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.draftButton, { borderColor: accentColor }]} onPress={() => handleSave(true)}>
              <Ionicons name="save-outline" size={20} color={accentColor} />
              <Text style={[styles.draftText, { color: accentColor }]}>Save Draft</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.publishButton, { backgroundColor: accentColor }]} onPress={() => handleSave(false)}>
              <Ionicons name="checkmark-outline" size={20} color="#fff" />
              <Text style={styles.publishText}>Publish</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  imagePicker: {
    height: 180, borderWidth: 1, borderRadius: 8, marginBottom: 16,
    overflow: 'hidden', justifyContent: 'center', alignItems: 'center'
  },
  eventImage: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center' },
  input: {
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 16,
    paddingVertical: 12, marginBottom: 16, fontSize: 16
  },
  quantityContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20
  },
  quantityText: { fontSize: 18, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  draftButton: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8,
    padding: 12, flex: 1, marginRight: 8
  },
  draftText: { marginLeft: 8, fontSize: 16 },
  publishButton: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 8,
    padding: 12, flex: 1, marginLeft: 8
  },
  publishText: { color: '#fff', fontSize: 16, marginLeft: 8 }
});

export default CreateEventScreen;
