import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemedContext';

import DiscoverScreen from './DiscoverScreen';
import SavedScreen from './SavedScreen';
import TicketsScreen from './TicketsScreen';
import UserDashboardScreen from './UserDashboardScreen';
import OrganizerAccountScreen from './OrganizerAccountScreen';
import UserAccountScreen from './UserAccountScreen';

const Tab = createBottomTabNavigator();

const UserTabNavigator: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const screenOptions = ({ route }: { route: any }) => ({
    tabBarIcon: ({ color, size }: { color: string; size: number }) => {
      let iconName: string;

      switch (route.name) {
        case 'Discover':
          iconName = 'search-outline';
          break;
        case 'Saved':
          iconName = 'bookmark-outline';
          break;
        case 'Tickets':
          iconName = 'ticket-outline';
          break;
        case 'Dashboard':
          iconName = 'person-outline';
          break;
        default:
          iconName = 'ellipse-outline';
      }

      return <Ionicons name={iconName as any} size={size} color={color} />;
    },
    tabBarActiveTintColor: '#4285F4',
    tabBarInactiveTintColor: isDark ? '#aaa' : '#555',
    headerShown: false,
    tabBarStyle: {
      backgroundColor: isDark ? '#121212' : '#fff',
      borderTopColor: isDark ? '#222' : '#ccc',
    },
  });

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Tickets" component={TicketsScreen} />
      <Tab.Screen name="Account" component={UserAccountScreen} />
    </Tab.Navigator>
  );
};

export default UserTabNavigator;
