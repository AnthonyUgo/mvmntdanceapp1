// OrganizerDashboardScreen.tsx
import React, { useContext, useLayoutEffect, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { ThemeContext } from '../contexts/ThemedContext';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEventsForOrganizer } from '../api';

type Ticket = {
  purchased: boolean;
  purchaserName?: string;
  purchaseDate?: string;
};

const screenWidth = Dimensions.get('window').width;

const OrganizerDashboardScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [purchases, setPurchases] = useState<{ purchaser: string; date: string }[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const bgColor = theme === 'dark' ? '#1e1e1e' : '#f0f0f0';
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const primaryColor = '#4285F4';

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('OrganizerAccount')}>
          <Ionicons
            name="person-circle-outline"
            size={28}
            color={theme === 'dark' ? '#fff' : primaryColor}
            style={{ marginRight: 16 }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, theme]);

  useEffect(() => {
    (async () => {
      try {
        const organizerId = await AsyncStorage.getItem('organizerUsername');
        if (!organizerId) return;

        // ← Use centralized API client
        const events = await getEventsForOrganizer(organizerId, false);

        const allPurchases: { purchaser: string; date: string }[] = [];
        const purchaseCounts: Record<string, number> = {};

        for (const event of events) {
          (event.tickets || []).forEach((ticket: Ticket) => {
            if (ticket.purchased) {
              const date = ticket.purchaseDate?.split('T')[0] || event.date;
              allPurchases.push({
                purchaser: ticket.purchaserName || 'User',
                date
              });
              purchaseCounts[date] = (purchaseCounts[date] || 0) + 1;
            }
          });
        }

        const sortedDates = Object.keys(purchaseCounts).sort().slice(-5);
        setChartData(sortedDates.map(d => purchaseCounts[d]));
        setPurchases(allPurchases.slice(-5).reverse());
      } catch (err) {
        console.error('❌ Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme === 'dark' ? '#121212' : '#fff' }
      ]}
    >
      {/* Analytics */}
      <View style={styles.analyticsSection}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Analytics</Text>
        {loading ? (
          <ActivityIndicator color={primaryColor} size="large" />
        ) : (
          <LineChart
            data={{
              labels: chartData.map((_, i) => `Day ${i + 1}`),
              datasets: [{ data: chartData }],
            }}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              backgroundColor: bgColor,
              backgroundGradientFrom: bgColor,
              backgroundGradientTo: bgColor,
              decimalPlaces: 0,
              color: opacity =>
                theme === 'dark'
                  ? `rgba(255,255,255,${opacity})`
                  : `rgba(66,133,244,${opacity})`,
              labelColor: opacity =>
                theme === 'dark'
                  ? `rgba(255,255,255,${opacity})`
                  : `rgba(0,0,0,${opacity})`,
              propsForBackgroundLines: {
                stroke: theme === 'dark' ? '#333' : '#ccc'
              },
            }}
            bezier
            style={styles.chart}
          />
        )}
      </View>

      {/* Create Event */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: bgColor }]}
        onPress={() => navigation.navigate('CreateEvent')}
      >
        <Ionicons name="add-circle-outline" size={24} color={primaryColor} />
        <Text style={[styles.buttonText, { color: textColor }]}>Create Event</Text>
      </TouchableOpacity>

      {/* Recent Purchases */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Recent Purchases
        </Text>
        {purchases.length === 0 ? (
          <Text style={{ color: textColor, fontSize: 14 }}>
            No purchases yet.
          </Text>
        ) : (
          purchases.map((item, idx) => (
            <View key={idx} style={styles.ticketItem}>
              <Text style={[styles.ticketText, { color: textColor }]}>
                {item.purchaser} – {item.date}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* View Events */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: bgColor }]}
        onPress={() => navigation.navigate('MyEvents')}
      >
        <Ionicons
          name="people-circle-outline"
          size={24}
          color={primaryColor}
        />
        <Text style={[styles.buttonText, { color: textColor }]}>
          View Events
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  analyticsSection: { marginBottom: 24 },
  chart: { borderRadius: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: { marginLeft: 8, fontSize: 16 },
  section: { marginBottom: 24 },
  ticketItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#555',
  },
  ticketText: { fontSize: 16 },
});

export default OrganizerDashboardScreen;
