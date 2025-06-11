import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemedContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // adjust path to match your file structure

// Dummy data
const eventsData = [
  { id: '1', title: 'Dance With OMGitsBjorn', date: '2025-06-09', draft: false },
  { id: '2', title: 'SalsaChips Night', date: '2025-06-10', draft: true },
  { id: '3', title: 'CarFree Rock Social', date: '2025-06-01', draft: false },
];

const MyEventsScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'MyEvents'>>();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'live' | 'past' | 'drafts'>('live');

  const textColor = theme === 'dark' ? '#fff' : '#000';
  const backgroundColor = theme === 'dark' ? '#121212' : '#f9f9f9';
  const accentColor = '#4285F4';

  const today = new Date();

  const filteredEvents = eventsData
    .filter(event => {
      const eventDate = new Date(event.date);
      if (activeTab === 'live') {
        return !event.draft && eventDate >= today;
      } else if (activeTab === 'past') {
        return !event.draft && eventDate < today;
      } else if (activeTab === 'drafts') {
        return event.draft;
      }
      return false;
    })
    .filter(event => event.title.toLowerCase().includes(search.toLowerCase()));

  const handleManageEvent = (event: any) => {
    navigation.navigate('ManageEvent', { eventId: event.id, isCollaborator: false });
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textColor }]}>My Events</Text>
        <TouchableOpacity>
          <Ionicons name="log-out-outline" size={24} color={accentColor} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
        <Ionicons name="search-outline" size={20} color={accentColor} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search for events..."
          placeholderTextColor={theme === 'dark' ? '#888' : '#666'}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('live')}
          style={[styles.tab, activeTab === 'live' && { borderBottomColor: accentColor }]}
        >
          <Text style={[styles.tabText, { color: activeTab === 'live' ? accentColor : textColor }]}>Live</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('past')}
          style={[styles.tab, activeTab === 'past' && { borderBottomColor: accentColor }]}
        >
          <Text style={[styles.tabText, { color: activeTab === 'past' ? accentColor : textColor }]}>Past</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('drafts')}
          style={[styles.tab, activeTab === 'drafts' && { borderBottomColor: accentColor }]}
        >
          <Text style={[styles.tabText, { color: activeTab === 'drafts' ? accentColor : textColor }]}>Drafts</Text>
        </TouchableOpacity>
      </View>

      {/* Events List */}
      <FlatList
        data={filteredEvents}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleManageEvent(item)}>
            <View style={[styles.eventItem, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
              <Ionicons name="calendar-outline" size={24} color={accentColor} />
              <Text style={[styles.eventTitle, { color: textColor }]}>{item.title}</Text>
              {item.draft && (
                <Ionicons name="document-outline" size={20} color={accentColor} style={{ marginLeft: 8 }} />
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ color: textColor, textAlign: 'center', marginTop: 20 }}>
            No events found.
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16
  },
  searchInput: { marginLeft: 8, flex: 1, fontSize: 16 },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc'
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabText: { fontSize: 16, fontWeight: '600' },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8
  },
  eventTitle: { marginLeft: 12, fontSize: 16, flex: 1 }
});

export default MyEventsScreen;
