import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, StyleSheet, Image, FlatList, TouchableOpacity, ScrollView, Linking, ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../contexts/ThemedContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

interface OrganizerData {
  id: string;
  profileImage: string;
  username: string;
  followers: string[];
  bio?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
}

interface Event {
  id: string;
  title: string;
  image: string;
}

interface RouteParams {
  username: string;
}

const OrganizerPublicProfileScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#121212' : '#fff';
  const textColor = isDark ? '#fff' : '#000';

  const route = useRoute();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { username } = route.params as RouteParams;

  const [organizer, setOrganizer] = useState<OrganizerData | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        const userRes = await axios.get(`${API_BASE_URL}/api/users/get?email=${email}`);
        const currUsername = userRes.data.user.username;
        setCurrentUsername(currUsername);

        const orgRes = await axios.get(`${API_BASE_URL}/api/users/by-username?username=${username}`);
        const orgData = orgRes.data.user;
        setOrganizer(orgData);

        const eventsRes = await axios.get(`${API_BASE_URL}/api/events?organizerId=${orgData.username}`);
        setEvents(eventsRes.data || []);

        if (orgData?.username) {
          navigation.setOptions({ title: `${orgData.username}'s Profile` });
        }

        if (orgData.followers?.includes(currUsername)) {
          setIsFollowing(true);
        }
      } catch (err) {
        console.error('❌ Error loading organizer profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  const handleFollow = async () => {
    if (!currentUsername || !organizer) return;
    setFollowLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/users/follow`, {
        follower: currentUsername,
        following: organizer.username,
      });
      setIsFollowing(true);
    } catch (err) {
      console.error('❌ Failed to follow user:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const openLink = (url?: string) => {
    if (url) Linking.openURL(url);
  };

  
  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventInfo', { eventId: item.id, organizerId: username })}
    >
      <Image source={{ uri: item.image }} style={styles.eventImage} />
      <Text style={[styles.eventTitle, { color: textColor }]} numberOfLines={1}>{item.title}</Text>
    </TouchableOpacity>
  );

  if (loading || !organizer) {
    return (
      <View style={[styles.center, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={textColor} />
        <Text style={{ color: textColor, marginTop: 12 }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: bgColor }} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.header}>
        <Image source={{ uri: organizer.profileImage }} style={styles.avatar} />
        <View style={{ marginLeft: 12 }}>
          <Text style={[styles.username, { color: textColor }]}>{organizer.username}</Text>
          <Text style={{ color: isDark ? '#ccc' : '#666' }}>{organizer.followers.length} followers</Text>
        </View>
      </View>

      {currentUsername !== organizer.username && (
        <TouchableOpacity
          style={[styles.followButton, { backgroundColor: isFollowing ? '#ccc' : '#a259ff' }]}
          onPress={handleFollow}
          disabled={isFollowing || followLoading}
        >
          <Text style={styles.followText}>
            {followLoading ? 'Loading...' : isFollowing ? 'Followed' : 'Follow'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Socials */}
      <View style={styles.socialRow}>
        {organizer.instagram && (
          <TouchableOpacity onPress={() => openLink(organizer.instagram)}>
            <Text style={[styles.socialLink, { color: textColor }]}>Instagram</Text>
          </TouchableOpacity>
        )}
        {organizer.facebook && (
          <TouchableOpacity onPress={() => openLink(organizer.facebook)}>
            <Text style={[styles.socialLink, { color: textColor }]}>Facebook</Text>
          </TouchableOpacity>
        )}
        {organizer.twitter && (
          <TouchableOpacity onPress={() => openLink(organizer.twitter)}>
            <Text style={[styles.socialLink, { color: textColor }]}>X</Text>
          </TouchableOpacity>
        )}
        {organizer.youtube && (
          <TouchableOpacity onPress={() => openLink(organizer.youtube)}>
            <Text style={[styles.socialLink, { color: textColor }]}>YouTube</Text>
          </TouchableOpacity>
        )}
      </View>

       {/* About Section */}
      <View style={{ marginTop: 24 }}>
         <Text style={[styles.sectionHeader, { color: textColor }]}>About</Text>
           {organizer.bio ? (
          <Text style={[styles.bioText, { color: textColor, marginTop: 8 }]}>
            {organizer.bio}
          </Text>
         ) : (
          <Text style={{ color: isDark ? '#aaa' : '#888', marginTop: 8 }}>
            This user hasn’t written a bio yet.
          </Text>
         )}
        </View>



      {/* Events */}
      <Text style={[styles.sectionHeader, { color: textColor }]}>Events</Text>
      {events.length === 0 ? (
        <Text style={{ color: isDark ? '#aaa' : '#888', marginTop: 8 }}>No events yet.</Text>
      ) : (
        <>
          <FlatList
            data={events.slice(0, 6)}
            renderItem={renderEvent}
            keyExtractor={(item) => item.id}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            contentContainerStyle={{ marginTop: 12 }}
            scrollEnabled={false}
          />
          {events.length > 6 && (
            <TouchableOpacity onPress={() => navigation.navigate('AllEventsScreen', { username })}>
              <Text style={[styles.viewAllText, { color: '#a259ff' }]}>View All Events →</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  username: { fontSize: 18, fontWeight: 'bold' },
  followButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
 },
  bioText: {
   fontSize: 14,
   lineHeight: 20,
   paddingVertical: 4,
 },
  socialRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, gap: 12 },
  socialLink: { fontSize: 14, fontWeight: '500', marginRight: 16 },
  sectionHeader: { fontSize: 18, fontWeight: '600', marginTop: 24 },
  eventCard: {
    width: '32%',
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
  },
  eventImage: { width: '100%', height: 100, borderRadius: 10 },
  eventTitle: { marginTop: 4, fontSize: 14, fontWeight: '500' },
  viewAllText: { marginTop: 10, fontSize: 15, fontWeight: '600', alignSelf: 'center' },
});

export default OrganizerPublicProfileScreen;
