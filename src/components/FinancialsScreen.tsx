import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';

const FinancialsScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState('7d');
  const [totalSales, setTotalSales] = useState(0);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  // Fetch Stripe earnings
  useEffect(() => {
    const fetchEarnings = async () => {
      const userEmail = await AsyncStorage.getItem('userEmail');
      if (!userEmail) return;

      try {
        const res = await axios.get(`${API_BASE_URL}/payments/earnings/${userEmail}`);
        const available = res.data.balance?.available?.[0]?.amount || 0;
        setTotalSales(available / 100); // Stripe returns cents
      } catch (err) {
        console.error('Earnings fetch error:', err);
      }
    };

    fetchEarnings();
  }, []);

  const connectToStripe = async () => {
    try {
      setLoadingStripe(true);
      const storedEmail = await AsyncStorage.getItem('userEmail');
      if (!storedEmail) {
        Alert.alert('Error', 'User email not found.');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/payments/create-stripe-account`, {
        email: storedEmail,
      });

      const url = response.data.alreadyConnected
        ? response.data.loginLink
        : response.data.onboardingUrl;

      Linking.openURL(url);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        Alert.alert('Stripe Error', err.response?.data?.error || 'Unable to connect to Stripe.');
      } else {
        Alert.alert('Stripe Error', 'An unexpected error occurred.');
      }
    } finally {
      setLoadingStripe(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: isDark ? '#121212' : '#fdfdfd',
      flexGrow: 1,
    },
    header: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 20,
      color: isDark ? '#fff' : '#000',
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
      color: isDark ? '#fff' : '#000',
      fontWeight: '500',
    },
    salesLabel: {
      fontSize: 18,
      color: isDark ? '#ccc' : '#666',
    },
    salesAmount: {
      fontSize: 32,
      fontWeight: '800',
      marginVertical: 10,
      color: isDark ? '#fff' : '#000',
    },
    section: {
      marginVertical: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 10,
      color: isDark ? '#fff' : '#000',
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
