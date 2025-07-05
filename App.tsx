import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-native-reanimated';
import HomeScreen from './src/components/HomeScreen';
import AuthScreen from './src/components/AuthScreen';
import OrganizerLoginScreen from './src/components/OrganizerLoginScreen';
import OrganizerSignUpScreen from './src/components/OrganizerSignUpScreen';
import OrganizerAccountScreen from './src/components/OrganizerAccountScreen';
import OrganizerDashboardScreen from './src/components/OrganizerDashboardScreen';
import AllEventsScreen from './src/components/AllEventsScreen';
import UserTabNavigator from './src/components/UserTabNavigator';
import ForgotPasswordScreen from './src/components/ForgotPasswordScreen';
import ProfileScreen from './src/components/ProfileScreen';
import SettingsScreen from './src/components/SettingScreen';
import OrganizerPublicProfileScreen from './src/components/OrganizerPublicProfileScreen';
import CreateEventScreen from './src/components/CreateEventScreen';
import MyEventsScreen from './src/components/MyEventScreen';
import ManageEventScreen from './src/components/ManageEventScreen';
import CheckoutScreen from './src/components/CheckoutScreen';
import FinancialsScreen from './src/components/FinancialsScreen';
import WebviewScreen from './src/components/WebviewScreen';
import EventInfoScreen from './src/components/EventInfoScreen';
import { ThemeProvider, ThemeContext } from './src/contexts/ThemedContext';

export type RootStackParamList = {
  Home: undefined;
  Auth: undefined;
  OrganizerLogin: undefined;
  OrganizerSignUp: undefined;
  OrganizerAccount: undefined;
  OrganizerDashboard: undefined;
  AllEventsScreen: { username: string };
  CreateEvent: undefined;
  EventInfo: { eventId: string; organizerId: string };
  MyEvents: { initialTab?: 'live' | 'drafts' | 'past' };
  ManageEvent: { eventId: string; isCollaborator?: boolean };
  Profile: undefined;
  OrganizerPublicProfile: { username: string };
  Checkout: { eventId: string; ticket: any; quantity: number };
  Settings: undefined;
  Financials: undefined;
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
              <Stack.Screen name="OrganizerLogin" component={OrganizerLoginScreen} options={{ title: 'Login' }} />
              <Stack.Screen name="OrganizerAccount" component={OrganizerAccountScreen} options={{ title: 'Organizer Account' }} />
              <Stack.Screen name="OrganizerPublicProfile" component={OrganizerPublicProfileScreen} options={{ title: 'Organizer Profile' }} />
              <Stack.Screen name="AllEventsScreen" component={AllEventsScreen} options={{ title: 'All Events' }} />
              <Stack.Screen name="OrganizerSignUp" component={OrganizerSignUpScreen} options={{ title: 'Sign Up' }} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Forgot Password' }} />
              <Stack.Screen
                name="OrganizerDashboard"
                component={OrganizerDashboardScreen}
                options={{ title: 'Dashboard', headerBackVisible: false, gestureEnabled: false }}
              />
              <Stack.Screen name="UserDashboard" component={UserTabNavigator} options={{ headerShown: false }} />
              <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
              <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
              <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: 'Create Event' }} />
              <Stack.Screen name="MyEvents" component={MyEventsScreen} options={{ title: 'My Events' }} />
              <Stack.Screen name="EventInfo" component={EventInfoScreen} />
              <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
              <Stack.Screen name="ManageEvent" component={ManageEventScreen} options={{ title: 'Manage Event' }} />
              <Stack.Screen name="Financials" component={FinancialsScreen} options={{ title: 'Manage Ego' }} />
              <Stack.Screen name="WebviewScreen" component={WebviewScreen} options={{ title: 'Map View' }} />
              
            </Stack.Navigator>
          </NavigationContainer>
        )}
      </ThemeContext.Consumer>
    </ThemeProvider>
  );
}
