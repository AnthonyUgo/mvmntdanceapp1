import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DiscoverScreen from './DiscoverScreen';
import SavedScreen from './SavedScreen';
import TicketsScreen from './TicketsScreen';
import ProfileScreen from './ProfileScreen';
import { ThemeContext } from '../contexts/ThemedContext';
import OrganizerAccountScreen from './OrganizerAccountScreen';

const Tab = createBottomTabNavigator();

const UserDashboardScreen: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'home';
          if (route.name === 'Discover') iconName = 'search';
          else if (route.name === 'Saved') iconName = 'heart';
          else if (route.name === 'Tickets') iconName = 'ticket';
          else if (route.name === 'Account') iconName = 'person';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#a259ff',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Tickets" component={TicketsScreen} />
   <Tab.Screen
        name="Account"
        component={OrganizerAccountScreen} // consider renaming to AccountSettingsScreen
        options={{ tabBarLabel: 'Account' }}
      />
    </Tab.Navigator>
  );
};

export default UserDashboardScreen;
