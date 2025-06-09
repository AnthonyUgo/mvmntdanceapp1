import React, { useContext, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ThemeContext } from '../contexts/ThemedContext';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const OrganizerDashboardScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);

  // Updated hook: removes the second generic parameter so that TypeScript allows all defined screens
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('OrganizerAccount')}>
          <Ionicons
            name="person-circle-outline"
            size={28}
            color={theme === 'dark' ? '#fff' : '#4285F4'}
            style={{ marginRight: 16 }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, theme]);

  const ticketsData = [
    { id: '1', purchaser: 'Jane Doe', date: '2025-06-08' },
    { id: '2', purchaser: 'John Smith', date: '2025-06-09' },
  ];

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [{ data: [10, 5, 8, 12, 7] }],
  };

  const bgColor = theme === 'dark' ? '#1e1e1e' : '#f0f0f0';
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const primaryColor = '#4285F4';

  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#121212' : '#fff' }]}>
      {/* Analytics Section */}
      <View style={styles.analyticsSection}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Analytics</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            backgroundColor: bgColor,
            backgroundGradientFrom: bgColor,
            backgroundGradientTo: bgColor,
            decimalPlaces: 0,
            color: (opacity = 1) =>
              theme === 'dark'
                ? `rgba(255,255,255,${opacity})`
                : `rgba(66,133,244,${opacity})`,
            labelColor: (opacity = 1) =>
              theme === 'dark'
                ? `rgba(255,255,255,${opacity})`
                : `rgba(0,0,0,${opacity})`,
            propsForBackgroundLines: {
              stroke: theme === 'dark' ? '#333' : '#ccc',
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Create Event Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: bgColor }]}
        onPress={() => navigation.navigate('CreateEvent')}
      >
        <Ionicons name="add-circle-outline" size={24} color={primaryColor} />
        <Text style={[styles.buttonText, { color: textColor }]}>Create Event</Text>
      </TouchableOpacity>

      {/* Recent Purchases */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Recent Purchases</Text>
        {ticketsData.map((item) => (
          <View key={item.id} style={styles.ticketItem}>
            <Text style={[styles.ticketText, { color: textColor }]}>
              {item.purchaser} - {item.date}
            </Text>
          </View>
        ))}
      </View>

      {/* View Events Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: bgColor }]}
        onPress={() => navigation.navigate('MyEvents')}
      >
        <Ionicons name="people-circle-outline" size={24} color={primaryColor} />
        <Text style={[styles.buttonText, { color: textColor }]}>View Events</Text>
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
