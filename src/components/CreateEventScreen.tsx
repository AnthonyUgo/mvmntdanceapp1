// src/screens/CreateEventScreen.tsx
import 'react-native-get-random-values';
import React, { useState, useContext, useMemo } from 'react';
import { Switch } from 'react-native';
import {
View, Text, TextInput, TouchableOpacity, StyleSheet,
Image, ScrollView, Dimensions, KeyboardAvoidingView,
Platform, TouchableWithoutFeedback, Keyboard, Alert
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SceneRendererProps } from 'react-native-tab-view';
import type { Route } from '@react-navigation/native';
import { ThemeContext } from '../contexts/ThemedContext';
import { createEvent } from '../api';
import type { RootStackParamList } from '../../App';


type TabKey = 'image' | 'details' | 'tickets' | 'settings';

type TabRoute = {
  key: TabKey;
  title: string;
};

type TicketStepProps = {
  ticketOptions: any[];
  setTicketOptions: (tickets: any[]) => void;
  ticketType: string;
  setTicketType: (type: 'Paid' | 'Free' | 'Donation') => void;
};

type NavProp = NativeStackNavigationProp<RootStackParamList, 'CreateEvent'>;
const initialLayout = { width: Dimensions.get('window').width };

const CreateEventScreen: React.FC = () => {
const nav = useNavigation<NavProp>();
const { theme } = useContext(ThemeContext);
const isDark = theme === 'dark';
const [index, setIndex] = useState(0);
const routes: TabRoute[] = [
  { key: 'image', title: 'Image' },
  { key: 'details', title: 'Details' },
  { key: 'tickets', title: 'Tickets' },
  { key: 'settings', title: 'Settings' }
];

const [imageUri, setImageUri] = useState<string|null>(null);
const [title, setTitle] = useState('');
const [description, setDescription] = useState('');
const [date, setDate] = useState(new Date());
const styles = useMemo(() => getStyles(isDark), [isDark]);
const [startTime, setStartTime] = useState(new Date());
const [endTime, setEndTime] = useState(new Date());
const [venueName, setVenueName] = useState('');
const [venueAddress, setVenueAddress] = useState('');
const [ticketName, setTicketName] = useState('');
const [ticketType, setTicketType] = useState<'Paid' | 'Free' | 'Donation'>('Paid');
const [ticketOptions, setTicketOptions] = useState<{ name: string; price?: string; qty: string; timeLimit?: string }[]>([]);

const [currentTicket, setCurrentTicket] = useState({
  name: '',
  price: '',
  qty: '',
  timeLimitValue: '',
  timeLimitUnit: 'days', // default
});
const [ticketPrice, setTicketPrice] = useState('');
const [ticketQty, setTicketQty] = useState('');
const [collaboratorInput, setCollaboratorInput] = useState('');
const [collaborators, setCollaborators] = useState<string[]>([]);
const [isPrivate, setIsPrivate] = useState(false);

const pickImage = async () => {
const res = await launchImageLibraryAsync({
mediaTypes: MediaTypeOptions.Images,
allowsEditing: true,
quality: 0.8
});
if (!res.canceled && res.assets.length) setImageUri(res.assets[0].uri);
};

const handlePublish = async () => {
const organizerId = await AsyncStorage.getItem('organizerUsername');
if (!title || !venueName || !ticketOptions.length) {
  return Alert.alert('Missing required fields');
}
const hasValidTickets = ticketOptions.every(t => t.name && t.qty && (ticketType !== 'Paid' || t.price));
if (!hasValidTickets) {
  return Alert.alert('Each ticket must have name, qty, and price if paid');
}
const payload = {
  id: Date.now().toString(),
  title,
  image: imageUri,
  description,
  startDate: startDate.toISOString().slice(0, 10),
  endDate: endDate.toISOString().slice(0, 10),
  startTime: startTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
  endTime: endTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
  venueName,
  venueAddress,
  tickets: ticketOptions.map(t => ({
  name: t.name,
  price: ticketType === 'Paid' ? parseFloat(t.price || '0') : 0,
  quantity: parseInt(t.qty, 10),
  type: ticketType,
  timeLimit: t.timeLimit || ''
})),
  visibility: isPrivate ? 'private' : 'public',
  collaborators,
  organizerId,
};

try {
  await createEvent(payload);
  Alert.alert('Success', 'Event created');
  nav.goBack();
} catch (err: any) {
  console.error(err);
  Alert.alert('Error', err.message || 'Failed to create event');
}
};
const ImageStep = React.memo(() => (
   <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    keyboardVerticalOffset={80} // tweak as needed
  >
<ScrollView contentContainerStyle={styles.step}>
<TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
{imageUri
? <Image source={{ uri: imageUri }} style={styles.image} />
: <Text style={styles.placeholder}>+ Add Event Image</Text>}
</TouchableOpacity>
<TextInput
style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
placeholder="Name Am"
placeholderTextColor="#888"
value={title}
onChangeText={setTitle}
/>
<TextInput
    style={[styles.input, { color: isDark ? '#fff' : '#000', height: 100 }]}
    placeholder="Wetin Dey Sup?"
    placeholderTextColor="#888"
    multiline
    value={description}
    onChangeText={setDescription}
  />
</ScrollView>
</KeyboardAvoidingView>
));

const [startDate, setStartDate] = useState(new Date());
const [endDate, setEndDate] = useState(new Date());
const [showStartDatePicker, setShowStartDatePicker] = useState(false);
const [showEndDatePicker, setShowEndDatePicker] = useState(false);
const [showStartTimePicker, setShowStartTimePicker] = useState(false);
const [showEndTimePicker, setShowEndTimePicker] = useState(false);

const DetailsStep = React.memo(() => (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    keyboardVerticalOffset={80}
  >
  <ScrollView contentContainerStyle={styles.step}>
    <Text style={styles.label}>Start Date</Text>
    <TouchableOpacity style={styles.input} onPress={() => setShowStartDatePicker(true)}>
      <Text>{startDate.toDateString()}</Text>
    </TouchableOpacity>
    {showStartDatePicker && (
     <View style={{ backgroundColor: isDark ? '#1F2937' : '#fff', borderRadius: 12 }}>
      <DateTimePicker
        value={startDate}
        mode="date"
        display="default"
        onChange={(event, selectedDate) => {
          setShowStartDatePicker(false);
          if (selectedDate) setStartDate(selectedDate);
        }}
      />
      </View>
    )}

    <Text style={styles.label}>End Date</Text>
    <TouchableOpacity style={styles.input} onPress={() => setShowEndDatePicker(true)}>
      <Text>{endDate.toDateString()}</Text>
    </TouchableOpacity>
    {showEndDatePicker && (
      <DateTimePicker
        value={endDate}
        mode="date"
        display="default"
        onChange={(event, selectedDate) => {
          setShowEndDatePicker(false);
          if (selectedDate) setEndDate(selectedDate);
        }}
      />
    )}
    {startDate && endDate && (
  <Text style={[styles.label, { marginTop: 4 }]}>
    Duration: {Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)} day(s)
  </Text>
)}


    <Text style={styles.label}>Start Time</Text>
    <TouchableOpacity style={styles.input} onPress={() => setShowStartTimePicker(true)}>
      <Text>{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>
    </TouchableOpacity>
    {showStartTimePicker && (
      <DateTimePicker
        value={startTime}
        mode="time"
        is24Hour={false}
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={(event, selectedTime) => {
          setShowStartTimePicker(false);
          if (selectedTime) setStartTime(selectedTime);
        }}
      />
    )}

    <Text style={styles.label}>End Time</Text>
    <TouchableOpacity style={styles.input} onPress={() => setShowEndTimePicker(true)}>
      <Text>{endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>
    </TouchableOpacity>
    {showEndTimePicker && (
      <DateTimePicker
        value={endTime}
        mode="time"
        is24Hour={false}
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={(event, selectedTime) => {
          setShowEndTimePicker(false);
          if (selectedTime) setEndTime(selectedTime);
        }}
      />
    )}

    <Text style={styles.label}>Venue Name</Text>
    <TextInput
      style={styles.input}
      placeholder="Venue Name"
      placeholderTextColor="#888"
      value={venueName}
      onChangeText={setVenueName}
    />

    <Text style={styles.label}>Venue Address</Text>
    <TextInput
      style={styles.input}
      placeholder="Venue Address"
      placeholderTextColor="#888"
      value={venueAddress}
      onChangeText={setVenueAddress}
    />
  </ScrollView>
  </KeyboardAvoidingView>
));

const TicketStep: React.FC<TicketStepProps> = ({
  ticketOptions,
  setTicketOptions,
  ticketType,
  setTicketType,
}) => {
  const [currentTicket, setCurrentTicket] = useState({
    name: '',
    price: '',
    qty: '',
    timeLimitValue: '',
    timeLimitUnit: 'days', // default to 'days'
  });

  const addTicket = () => {
    if (!currentTicket.name || !currentTicket.qty) return;

    const timeLimit = currentTicket.timeLimitValue
      ? `${currentTicket.timeLimitValue} ${currentTicket.timeLimitUnit}`
      : '';

    setTicketOptions([
      ...ticketOptions,
      {
        name: currentTicket.name,
        price: currentTicket.price,
        qty: currentTicket.qty,
        timeLimit,
      },
    ]);

    setCurrentTicket({
      name: '',
      price: '',
      qty: '',
      timeLimitValue: '',
      timeLimitUnit: 'days',
    });
  };

  const deleteTicket = (index: number) => {
    const updated = [...ticketOptions];
    updated.splice(index, 1);
    setTicketOptions(updated);
  };

  const editTicket = (index: number) => {
    const toEdit = ticketOptions[index];
    const [value, unit] = toEdit.timeLimit?.split(' ') || ['', 'days'];

    setCurrentTicket({
      name: toEdit.name,
      price: toEdit.price || '',
      qty: toEdit.qty,
      timeLimitValue: value,
      timeLimitUnit: unit,
    });

    deleteTicket(index);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.step}>
          <Text style={styles.label}>Select Ticket Type</Text>
          <View style={styles.dropdownContainer}>
            {(['Paid', 'Free', 'Donation'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setTicketType(type)}
                style={[
                  styles.dropdownOption,
                  ticketType === type && styles.selectedOption,
                ]}
              >
                <Text>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Ticket Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Regular, VIP, BFF"
            placeholderTextColor="#888"
            value={currentTicket.name}
            onChangeText={(text) =>
              setCurrentTicket({ ...currentTicket, name: text })
            }
          />

          {ticketType === 'Paid' && (
            <>
              <Text style={styles.label}>Price</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 10.00"
                placeholderTextColor="#888"
                keyboardType="decimal-pad"
                value={currentTicket.price}
                onChangeText={(text) =>
                  setCurrentTicket({ ...currentTicket, price: text })
                }
              />

              <Text style={styles.label}>Time Limit (Optional)</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="e.g. 2"
                  keyboardType="number-pad"
                  value={currentTicket.timeLimitValue}
                  onChangeText={(text) =>
                    setCurrentTicket({
                      ...currentTicket,
                      timeLimitValue: text,
                    })
                  }
                />
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  {['days', 'hours', 'minutes'].map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      onPress={() =>
                        setCurrentTicket({
                          ...currentTicket,
                          timeLimitUnit: unit,
                        })
                      }
                      style={{
                        backgroundColor:
                          currentTicket.timeLimitUnit === unit ? '#bb40ebff' : '#ccc',
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ color: '#fff' }}>{unit}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            placeholder="Quantity"
            placeholderTextColor="#888"
            keyboardType="number-pad"
            value={currentTicket.qty}
            onChangeText={(text) =>
              setCurrentTicket({ ...currentTicket, qty: text })
            }
          />

          <TouchableOpacity onPress={addTicket}>
            <Text style={[styles.navText, { textAlign: 'center' }]}>Add Ticket</Text>
          </TouchableOpacity>

          {ticketOptions.length > 0 && (
            <>
              <Text style={styles.label}>Tickets Added</Text>
              {ticketOptions.map((t, i) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: '#f4f4f4',
                    borderRadius: 16,
                    padding: 12,
                    marginBottom: 10,
                    shadowColor: '#000',
                    shadowOpacity: 0.05,
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Text style={{ fontWeight: '600' }}>{t.name}</Text>
                  <Text>
                    {ticketType === 'Paid' ? `$${t.price}` : ticketType} – {t.qty} available
                  </Text>
                  {t.timeLimit ? (
                    <Text style={{ fontSize: 12, color: '#999' }}>
                      ⏰ {t.timeLimit}
                    </Text>
                  ) : null}
                  <View style={{ flexDirection: 'row', marginTop: 8, gap: 12 }}>
                    <TouchableOpacity onPress={() => editTicket(i)}>
                      <Text style={{ color: '#007aff' }}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteTicket(i)}>
                      <Text style={{ color: '#ff3b30' }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};



const SettingsStep = () => (
   <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    keyboardVerticalOffset={80}
  >
  <ScrollView contentContainerStyle={styles.step}>
    <View style={styles.bubbleCard}>
      <Text style={styles.label}>Event Visibility</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: '#333', fontSize: 16 }}>{isPrivate ? 'Private' : 'Public'}</Text>
        <Switch
          value={isPrivate}
          onValueChange={setIsPrivate}
          trackColor={{ false: '#ccc', true: '#4285F4' }}
          thumbColor="#fff"
        />
      </View>
    </View>

    <View style={styles.bubbleCard}>
      <Text style={styles.label}>Add Collaborators</Text>
      <TextInput
        style={styles.input}
        placeholder="Type @ + username"
        placeholderTextColor="#888"
        value={collaboratorInput}
        onChangeText={handleCollaboratorChange}
      />
      {collaborators.map((u, i) => (
        <Text key={i} style={{ color: '#555' }}>@{u}</Text>
      ))}
    </View>
  </ScrollView>
  </KeyboardAvoidingView>
);

const handleCollaboratorChange = async (text: string) => {
  setCollaboratorInput(text);
  if (text.startsWith('@') && text.length > 1) {
    const query = text.slice(1, 2); // first letter after "@"
    try {
      const res = await fetch(`https://jomvmnt.documents.azure.com:443/api/users/search?prefix=${query}`);
      const json = await res.json();
      if (Array.isArray(json.users)) setCollaborators(json.users);
    } catch (err) {
      console.error('Collaborator search failed', err);
    }
  } else {
    setCollaborators([]);
  }
};

const TicketWrapper = React.memo(() => (
  <TicketStep
    ticketOptions={ticketOptions}
    setTicketOptions={setTicketOptions}
    ticketType={ticketType}
    setTicketType={setTicketType}
  />
));


const renderScene = SceneMap({
  image: ImageStep,
  details: DetailsStep,
  tickets: TicketWrapper,
  settings: SettingsStep,
});




return (
  <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={{ flex: 1 }}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene} // 👈 Just call the actual renderScene here
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        lazy
        renderTabBar={(props) => (
          <TabBar
            {...props}
            scrollEnabled
            style={{ backgroundColor: isDark ? '#111' : '#eee' }}
            indicatorStyle={{ backgroundColor: '#4285F4' }}
            activeColor={isDark ? '#fff' : '#000'}
            inactiveColor="#888"
          />
        )}
      />

      <View style={styles.navButtons}>
        {index > 0 && (
          <TouchableOpacity onPress={() => setIndex(i => i - 1)}>
            <Text style={styles.navText}>Back</Text>
          </TouchableOpacity>
        )}
        {index < routes.length - 1 ? (
          <TouchableOpacity onPress={() => setIndex(i => i + 1)}>
            <Text style={[styles.navText, { color: '#4285F4' }]}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handlePublish}>
            <Text style={[styles.navText, { color: '#4285F4' }]}>Publish</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  </KeyboardAvoidingView>
);
};

export default CreateEventScreen;

const getStyles = (isDark: boolean) => StyleSheet.create({
  step: {
    padding: 16,
    backgroundColor: isDark ? '#000' : '#f2f2f7',
    flexGrow: 1,
  },

  imagePicker: {
    height: 200,
    borderWidth: 1,
    borderColor: isDark ? '#555' : '#ccc',
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: isDark ? '#1e1e1e' : '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#D1D5DB' : '#333', // light gray on dark, dark gray on light
    marginBottom: 4,
    marginTop: 12,
  },

  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },

  placeholder: {
    color: isDark ? '#666' : '#999',
    fontSize: 16,
    fontWeight: '500',
  },

  input: {
    width: '100%',
    backgroundColor: isDark ? '#1e1e1e' : '#fff',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 16,
    fontSize: 16,
    color: isDark ? '#fff' : '#000', // <– Ensure input text shows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: isDark ? '#555' : '#d1d1d6',
  },

  bubbleCard: {
    backgroundColor: isDark ? '#1F2937' : '#fff',
    borderRadius: 24,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.2 : 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#374151' : 'transparent',
  },

  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderColor: isDark ? '#374151' : '#e0e0e0',
    backgroundColor: isDark ? '#111827' : '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },

  navText: {
    fontSize: 17,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    color: isDark ? '#A78BFA' : '#4285F4',
  },

  dropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  dropdownOption: {
    flex: 1,
    padding: 12,
    backgroundColor: isDark ? '#2D2D2D' : '#eee',
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },

  selectedOption: {
    backgroundColor: isDark ? '#7C3AED' : '#4285F4',
    borderColor: isDark ? '#A78BFA' : '#000',
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});

