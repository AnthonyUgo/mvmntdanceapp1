import React, { useContext } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { ThemeContext } from '../contexts/ThemedContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

type Props = {
  navigation: SettingsScreenNavigationProp;
};

const SettingsScreen: React.FC<Props> = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <View style={[styles.container, theme === 'dark' && styles.containerDark]}>
      {/* Dark Mode Row */}
      <View style={styles.settingRow}>
        <Text style={[styles.title, theme === 'dark' && styles.titleDark]}>Dark Mode</Text>
        <Switch
          value={theme === 'dark'}
          onValueChange={toggleTheme}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={theme === 'dark' ? '#34c759' : '#f4f3f4'}
        />
      </View>
      {/* Divider Line */}
      <View style={[styles.divider, theme === 'dark' && styles.dividerDark]} />

      {/* Placeholder for additional settings */}
      {/* <View style={styles.settingRow}>
        <Text style={[styles.title, theme === 'dark' && styles.titleDark]}>Other Setting</Text>
        <Ionicons name="chevron-forward" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
      </View>
      <View style={[styles.divider, theme === 'dark' && styles.dividerDark]} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
  },
  titleDark: {
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  dividerDark: {
    backgroundColor: '#444',
  },
});

export default SettingsScreen;
