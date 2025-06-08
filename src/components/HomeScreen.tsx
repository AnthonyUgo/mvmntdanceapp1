import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemedContext';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <View style={[styles.container, theme === 'dark' && styles.containerDark]}>
      {/* Top Right - Profile Icon */}
      <TouchableOpacity
        style={styles.topRight}
        onPress={() => navigation.navigate('Profile')}
      >
        <Ionicons
          name="person-circle-outline"
          size={32}
          color={theme === 'dark' ? '#fff' : '#4285F4'}
        />
      </TouchableOpacity>

      {/* Center Title */}
      <View style={styles.centerContent}>
        <Text style={[styles.title, theme === 'dark' && styles.titleDark]}>Home Screen</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Auth')}>
          <Text style={[styles.authButton, theme === 'dark' && styles.authButtonDark]}>Go to Auth</Text>
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
          color={theme === 'dark' ? '#fff' : '#4285F4'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  titleDark: {
    color: '#fff',
  },
  authButton: {
    fontSize: 18,
    color: '#4285F4',
    fontWeight: 'bold',
  },
  authButtonDark: {
    color: '#fff',
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
