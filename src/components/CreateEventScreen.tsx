import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Alert,
  Platform
} from 'react-native';
import { ThemeContext } from '../contexts/ThemedContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

const CreateEventScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);

  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [ticketPrice, setTicketPrice] = useState('');
  const [ticketQuantity, setTicketQuantity] = useState(1);

  const backgroundColor = theme === 'dark' ? '#121212' : '#fff';
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const accentColor = '#4285F4';

  // Handle Date Picker
  const onChangeDate = (_: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      // Only allow today's date
      const today = new Date();
      if (
        selectedDate.getDate() === today.getDate() &&
        selectedDate.getMonth() === today.getMonth() &&
        selectedDate.getFullYear() === today.getFullYear()
      ) {
        setEventDate(selectedDate);
      } else {
        Alert.alert('Invalid Date', 'You can only select today’s date.');
      }
    }
  };

  // Handle Ticket Price Input
  const handlePriceChange = (text: string) => {
    // Remove non-numeric except dot
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    let formatted = parts[0];
    if (parts.length > 1) {
      formatted += '.' + parts[1].slice(0, 2); // Limit to 2 decimal places
    }
    setTicketPrice(formatted);
  };

  // Increase ticket quantity
  const increaseQuantity = () => setTicketQuantity((prev) => prev + 1);

  // Decrease ticket quantity
  const decreaseQuantity = () => {
    if (ticketQuantity > 1) setTicketQuantity((prev) => prev - 1);
  };

  // Submit Handler
  const handleSubmit = () => {
    Keyboard.dismiss();
    Alert.alert(
      'Event Created',
      `Name: ${eventName}\nDate: ${format(eventDate, 'PPPP')}\nPrice: $${ticketPrice}\nQuantity: ${ticketQuantity}`
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Create Event</Text>

      {/* Event Name */}
      <TextInput
        style={[styles.input, { color: textColor, borderColor: accentColor }]}
        placeholder="Event Name"
        placeholderTextColor={theme === 'dark' ? '#888' : '#666'}
        value={eventName}
        onChangeText={setEventName}
      />

      {/* Event Date */}
      <TouchableOpacity
        style={[styles.datePicker, { borderColor: accentColor }]}
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons name="calendar-outline" size={24} color={accentColor} />
        <Text style={[styles.dateText, { color: textColor }]}>
          {format(eventDate, 'PPP')}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={eventDate}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      {/* Ticket Price */}
      <View style={[styles.inputContainer, { borderColor: accentColor }]}>
        <Text style={[styles.dollarSign, { color: textColor }]}>$</Text>
        <TextInput
          style={[styles.input, { flex: 1, color: textColor }]}
          placeholder="0.00"
          placeholderTextColor={theme === 'dark' ? '#888' : '#666'}
          value={ticketPrice}
          onChangeText={handlePriceChange}
          keyboardType="decimal-pad"
        />
      </View>

      {/* Ticket Quantity */}
      <View style={[styles.quantityContainer, { borderColor: accentColor }]}>
        <TouchableOpacity onPress={decreaseQuantity}>
          <Ionicons name="remove-circle-outline" size={28} color={accentColor} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            // allow manual editing
            Alert.prompt(
              'Edit Quantity',
              'Enter ticket quantity:',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'OK',
                  onPress: (input) => {
                    const num = parseInt(input || '1', 10);
                    if (!isNaN(num) && num > 0) {
                      setTicketQuantity(num);
                    }
                  },
                },
              ],
              'plain-text',
              `${ticketQuantity}`,
              'number-pad'
            );
          }}
        >
          <Text style={[styles.quantityText, { color: textColor }]}>{ticketQuantity}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={increaseQuantity}>
          <Ionicons name="add-circle-outline" size={28} color={accentColor} />
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: accentColor }]}
        onPress={handleSubmit}
      >
        <Ionicons name="checkmark-outline" size={24} color="#fff" />
        <Text style={styles.submitText}>Create Event</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  dateText: { marginLeft: 12, fontSize: 16 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
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
    marginBottom: 20,
  },
  quantityText: { fontSize: 18, fontWeight: '600' },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
  },
  submitText: { color: '#fff', fontSize: 16, marginLeft: 8 },
});

export default CreateEventScreen;
