// App.tsx
import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/components/HomeScreen';
import AuthScreen from './src/components/AuthScreen';
import OrganizerLoginScreen from './src/components/OrganizerLoginScreen';
import OrganizerSignUpScreen from './src/components/OrganizerSignUpScreen';
import OrganizerAccountScreen from './src/components/OrganizerAccountScreen';
import OrganizerDashboardScreen from './src/components/OrganizerDashboardScreen';
import UserTabNavigator from './src/components/UserTabNavigator';
import { ThemeProvider, ThemeContext } from './src/contexts/ThemedContext';
import ForgotPasswordScreen from './src/components/ForgotPasswordScreen';
import ProfileScreen from './src/components/ProfileScreen';
import SettingsScreen from './src/components/SettingScreen';
import CreateEventScreen from './src/components/CreateEventScreen';
import MyEventsScreen from './src/components/MyEventScreen';
import ManageEventScreen from './src/components/ManageEventScreen';
import WebviewScreen from './src/components/WebviewScreen';

export type RootStackParamList = {
  Home: undefined;
  Auth: undefined;
  OrganizerLogin: undefined;
  OrganizerSignUp: undefined;
  OrganizerDashboard: undefined;
  OrganizerAccount: undefined;
  CreateEvent: undefined;
  MyEvents: { initialTab?: 'live' | 'drafts' | 'past' } | undefined;
  ManageEvent: { eventId: string; isCollaborator?: boolean };
  Profile: undefined;
  Settings: undefined;
  ForgotPassword: undefined;
  WebviewScreen: { url: string };
  UserDashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ThemeProvider>
      <ThemeContext.Consumer>
        {({ theme }) => (
          <NavigationContainer theme={theme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack.Navigator initialRouteName="Home">
              <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'Sign In' }} />
              <Stack.Screen name="OrganizerLogin" component={OrganizerLoginScreen} options={{ title: 'Organizer Login' }} />
              <Stack.Screen name="OrganizerAccount" component={OrganizerAccountScreen} options={{ title: 'Organizer Account' }} />
              <Stack.Screen name="OrganizerSignUp" component={OrganizerSignUpScreen} options={{ title: 'Sign Up' }} />
              <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
                options={{ title: 'Forgot Password' }}
              />
              <Stack.Screen name="OrganizerDashboard" component={OrganizerDashboardScreen} options={{ title: 'Dashboard', headerBackVisible: false, gestureEnabled: false }} />
              <Stack.Screen name="UserDashboard" component={UserTabNavigator} options={{ headerShown: false }} />
              <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
              <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
              <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: 'Create Event' }} />
              <Stack.Screen name="MyEvents" component={MyEventsScreen} options={{ title: 'My Events' }} />
              <Stack.Screen
                name="ManageEvent"
                component={ManageEventScreen}
                options={{ title: 'Manage Event' }}
              />
              <Stack.Screen
                name="WebviewScreen"
                component={WebviewScreen}
                options={{ title: 'Map View' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        )}
      </ThemeContext.Consumer>
    </ThemeProvider>
  );
}
