// src/components/PlaceSearch.tsx
import React from 'react';
import { Platform } from 'react-native';
import { 
  GOOGLE_API_KEY_IOS, 
  GOOGLE_API_KEY_ANDROID 
} from '@env';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const API_KEY = Platform.select({
  ios: GOOGLE_API_KEY_IOS,
  android: GOOGLE_API_KEY_ANDROID,
});

export function PlaceSearch({ onPlaceSelected }: { onPlaceSelected: any }) {
  return (
    <GooglePlacesAutocomplete
      placeholder="Search for a place"
      fetchDetails
      onPress={(data, details) => {
        onPlaceSelected({ data, details });
      }}
      query={{
        key: API_KEY,
        language: 'en',
      }}
      styles={{
        textInput: { fontSize: 16 },
        container: { flex: 1 },
      }}
    />
  );
}
