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
  onSaveToggle?: () => void | Promise<void>;
  saved?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  title,
  date,
  startTime,
  venueName,
  image,
  price = 'Free',
  onPress,
  onSaveToggle,
  saved = false,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {image ? (
        <Image source={{ uri: image }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Ionicons name="image-outline" size={40} color="#aaa" />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.meta}>{date} • {startTime}</Text>
        <Text style={styles.meta}>{venueName}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>{price}</Text>
          {onSaveToggle && (
            <TouchableOpacity onPress={onSaveToggle}>
              <Ionicons
                name={saved ? 'heart' : 'heart-outline'}
                size={22}
                color={saved ? '#e91e63' : '#aaa'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
   

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  footer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});

export default EventCard;
