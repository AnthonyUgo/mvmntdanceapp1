import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface EventCardProps {
  id: string;
  title: string;
  date: string;
  startTime: string;
  venueName: string;
  image?: string;
  price?: string;
  onPress?: () => void;
  onSaveToggle?: () => Promise<void>;
  saved?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  title, date, startTime, venueName, image, price,
  onPress, onSaveToggle, saved = false
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    {image && <Image source={{ uri: image }} style={styles.image} />}
    <View style={styles.headerRow}>
      <Text style={styles.title}>{title}</Text>
      {onSaveToggle && (
        <Ionicons
          name={saved ? 'heart' : 'heart-outline'}
          size={24}
          color={saved ? '#a259ff' : '#888'}
          onPress={onSaveToggle}
        />
      )}
    </View>
    <Text style={styles.subtitle}>{date} • {startTime}</Text>
    <Text style={styles.subtitle}>{venueName}</Text>
    <Text style={styles.price}>{price ?? 'Free'}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    padding: 12,
  },
  image: {
    width: '100%', height: 180, borderRadius: 8, marginBottom: 8
  },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  title: { fontSize: 18, fontWeight: '600', flex: 1 },
  subtitle: { fontSize: 14, color: '#666', marginTop: 2 },
  price: { fontSize: 16, fontWeight: '500', marginTop: 4 },
});

export default EventCard;
