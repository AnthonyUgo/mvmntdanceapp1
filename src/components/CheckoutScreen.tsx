import React, { useContext, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../App';
import { ThemeContext } from '../contexts/ThemedContext';
import axios from 'axios';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { API_BASE_URL } from '@env';

type CheckoutScreenRouteProp = RouteProp<RootStackParamList, 'Checkout'>;

const CheckoutScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#121212' : '#fff';
  const textColor = isDark ? '#fff' : '#000';

  const route = useRoute<CheckoutScreenRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { eventId, ticket } = route.params;

  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/payments/create-checkout-session`, {
        eventId,
        ticketId: ticket.id,
        quantity: 1, // Update for quantity if needed
      });

      const checkoutUrl = res.data.url;
      navigation.navigate('WebviewScreen', { url: checkoutUrl });
    } catch (err) {
      console.error('Error creating checkout session:', err);
      Alert.alert('Payment Error', 'Unable to start checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.header, { color: textColor }]}>Checkout</Text>

      <View style={styles.card}>
        <Text style={[styles.label, { color: textColor }]}>Ticket:</Text>
        <Text style={[styles.value, { color: textColor }]}>{ticket.name}</Text>

        <Text style={[styles.label, { color: textColor, marginTop: 12 }]}>Price:</Text>
        <Text style={[styles.value, { color: textColor }]}>${ticket.price}</Text>

        <Text style={[styles.label, { color: textColor, marginTop: 12 }]}>Quantity:</Text>
        <Text style={[styles.value, { color: textColor }]}>1</Text>

        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: textColor }]}>Total:</Text>
          <Text style={[styles.totalValue, { color: textColor }]}>${ticket.price}</Text>
        </View>

        <TouchableOpacity
          style={styles.payButton}
          onPress={handlePurchase}
          disabled={loading}
        >
          <Text style={styles.payText}>
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: {
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 16,
  },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '600' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 12,
  },
  totalLabel: { fontSize: 16, fontWeight: '600' },
  totalValue: { fontSize: 16, fontWeight: '600' },
  payButton: {
    marginTop: 24,
    backgroundColor: '#a259ff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  payText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;
