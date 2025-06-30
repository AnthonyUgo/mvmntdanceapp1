import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';

const FinancialsScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState('7d');
  const [totalSales, setTotalSales] = useState(0);
  const [loadingStripe, setLoadingStripe] = useState(false);

  const connectToStripe = async () => {
    try {
      setLoadingStripe(true);
      const storedEmail = await AsyncStorage.getItem('userEmail');
      if (!storedEmail) {
        Alert.alert('Error', 'User email not found.');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/payments/create-stripe-account`, {
        userId: storedEmail,
      });

      if (response.data.alreadyConnected) {
        Linking.openURL(response.data.loginLink);
      } else {
        Linking.openURL(response.data.onboardingUrl);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        Alert.alert('Stripe Error', err.response?.data?.error || 'Unable to connect to Stripe.');
      } else {
        Alert.alert('Stripe Error', 'An unexpected error occurred.');
      }
    } finally {
      setLoadingStripe(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Financials</Text>

      <View style={styles.filterRow}>
        {['7d', '30d', 'all'].map((range) => (
          <TouchableOpacity
            key={range}
            onPress={() => setSelectedFilter(range)}
            style={[styles.filterButton, selectedFilter === range && styles.activeFilter]}
          >
            <Text style={styles.filterText}>
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.salesLabel}>Total Sales</Text>
      <Text style={styles.salesAmount}>${totalSales.toFixed(2)}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stripe Setup</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#6366F1' }]}
          onPress={connectToStripe}
          disabled={loadingStripe}
        >
          {loadingStripe ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Connect to Stripe</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manage Payment Method</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Add / Update Payout Method</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Withdraw Funds</Text>
        <TouchableOpacity style={[styles.button, styles.withdrawButton]}>
          <Text style={styles.buttonText}>Withdraw</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default FinancialsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fdfdfd',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-around',
  },
  filterButton: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 12,
  },
  activeFilter: {
    backgroundColor: '#4285F4',
  },
  filterText: {
    color: '#000',
    fontWeight: '500',
  },
  salesLabel: {
    fontSize: 18,
    color: '#666',
  },
  salesAmount: {
    fontSize: 32,
    fontWeight: '800',
    marginVertical: 10,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#222',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  withdrawButton: {
    backgroundColor: '#E53935',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
