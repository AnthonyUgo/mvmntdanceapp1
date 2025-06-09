import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemedContext';

// Import your background image here:
const bgImage = require('../../assets/jo_mvmnt_bg.png');

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);

  const backgroundColor = theme === 'dark' ? '#121212' : '#fff';
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const accentColor = '#4285F4';

  return (
    <ImageBackground
      source={bgImage}
      style={[styles.container, { backgroundColor }]}
      resizeMode="cover"
    >
      {/* Top Right - Organizer Icon */}
      <TouchableOpacity
        style={styles.topRight}
        onPress={() => navigation.navigate('OrganizerLogin')}
      >
        <Ionicons
          name="storefront-outline"
          size={32}
          color={textColor}
        />
      </TouchableOpacity>

      {/* Center Content */}
      <View style={styles.centerContent}>
        {/* App Name */}
        <Text style={[styles.appName, { color: accentColor }]}>u go dance?</Text>

        {/* Sign In Button */}
        <TouchableOpacity
          style={[styles.signInButton, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f0f0f0' }]}
          onPress={() => navigation.navigate('Auth')}
        >
          <Ionicons
            name="log-in-outline"
            size={24}
            color={accentColor}
          />
          <Text style={[styles.signInText, { color: textColor }]}>Sign In</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Right - Settings Icon */}
      <TouchableOpacity
        style={styles.bottomRight}
        onPress={() => navigation.navigate('Settings')}
      >
        <Ionicons
          name="settings-outline"
          size={32}
          color={textColor}
        />
      </TouchableOpacity>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  signInText: {
    fontSize: 16,
    marginLeft: 8,
  },
  topRight: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
  bottomRight: {
    position: 'absolute',
    bottom: 50,
    right: 20,
  },
});

export default HomeScreen;
