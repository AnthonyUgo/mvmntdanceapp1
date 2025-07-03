import React, { useContext, useLayoutEffect, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { ThemeContext } from '../contexts/ThemedContext';
import { getEventsForOrganizer } from '../api';
import {
  AnalyticsChart,
  CreateEventButton,
  ViewEventsButton,
  RecentPurchases,
  DashboardWidget
} from '../components/widgets';
import { RootStackParamList } from '../../App';

const OrganizerDashboardScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const allPurchases: { purchaser: string; date: string }[] = [];
  const [purchases, setPurchases] = useState<{ purchaser: string; date: string }[]>([]);
  const purchaseCounts: Record<string, number> = {};
  const [chartData, setChartData] = useState<{ x: string; y: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const bgColor = theme === 'dark' ? '#1e1e1e' : '#f0f0f0';
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const primaryColor = '#4285F4';

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Ionicons
          name="person-circle-outline"
          size={28}
          color={primaryColor}
          style={{ marginRight: 16 }}
          onPress={() => navigation.navigate('OrganizerAccount')}
        />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    (async () => {
      try {
        const organizerId = await AsyncStorage.getItem('organizerUsername');
        if (!organizerId) return;

        const events = await getEventsForOrganizer(organizerId, false);
        const allPurchases: { purchaser: string; date: string }[] = [];
        const purchaseCounts: Record<string, number> = {};

        for (const event of events) {
          (event.tickets || []).forEach((ticket: any) => {
            if (ticket.purchased) {
              const date = ticket.purchaseDate?.split('T')[0] || event.date;
              allPurchases.push({ purchaser: ticket.purchaserName || 'User', date });
              purchaseCounts[date] = (purchaseCounts[date] || 0) + 1;
            }
          });
        }

        const sortedDates = Object.keys(purchaseCounts).sort().slice(-5);
        setChartData(sortedDates.map((d, i) => ({ x: `Day ${i + 1}`, y: purchaseCounts[d] ?? 0 })));
        setPurchases(allPurchases.slice(-5).reverse());
      } catch (err) {
        console.error('❌ Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#121212' : '#fff' }]}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>Analytics</Text>
      {loading ? (
        <ActivityIndicator color={primaryColor} size="large" />
      ) : (
        <AnalyticsChart data={chartData} />
      )}

      <CreateEventButton />
      <RecentPurchases purchases={purchases} textColor={textColor} />
      <ViewEventsButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
});

export default OrganizerDashboardScreen;
