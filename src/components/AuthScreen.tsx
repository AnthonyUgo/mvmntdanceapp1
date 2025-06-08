import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../contexts/ThemedContext';

const AuthScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <View style={[styles.container, theme === 'dark' && styles.containerDark]}>
      <Text style={[styles.title, theme === 'dark' && styles.titleDark]}>Auth Screen</Text>
      <Text style={[styles.subtitle, theme === 'dark' && styles.subtitleDark]}>
        Welcome to the Auth screen!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  titleDark: {
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
  },
  subtitleDark: {
    color: '#ccc',
  },
});

export default AuthScreen;
