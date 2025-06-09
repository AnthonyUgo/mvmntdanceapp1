import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/components/HomeScreen';
import AuthScreen from './src/components/AuthScreen';
import OrganizerLoginScreen from './src/components/OrganizerLoginScreen'; // ✅ NEW SCREEN
import OrganizerDashboardScreen from './src/components/OrganizerDashboardScreen'; // Assuming you already have this
import ProfileScreen from './src/components/ProfileScreen';
import SettingsScreen from './src/components/SettingScreen';
import { ThemeProvider, ThemeContext } from './src/contexts/ThemedContext';

// 1️⃣ Define your stack param list
export type RootStackParamList = {
  Home: undefined;
  Auth: undefined;
  OrganizerLogin: undefined;
  OrganizerDashboard: undefined;
  Profile: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ThemeProvider>
      <ThemeContext.Consumer>
        {({ theme }) => (
          <NavigationContainer theme={theme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack.Navigator initialRouteName="Home">
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Auth"
                component={AuthScreen}
                options={{ headerShown: true, title: 'User Login' }}
              />
              <Stack.Screen
                name="OrganizerLogin"
                component={OrganizerLoginScreen}
                options={{ headerShown: true, title: 'Organizer Login' }}
              />
              <Stack.Screen
                name="OrganizerDashboard"
                component={OrganizerDashboardScreen}
                options={{ headerShown: true, title: 'Dashboard' }}
              />
              <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ headerShown: true, title: 'Profile' }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ headerShown: true, title: 'Settings' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        )}
      </ThemeContext.Consumer>
    </ThemeProvider>
  );
}
