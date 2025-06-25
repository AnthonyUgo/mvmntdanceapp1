import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/components/HomeScreen';
import AuthScreen from './src/components/AuthScreen';
import OrganizerLoginScreen from './src/components/OrganizerLoginScreen';
import OrganizerAccountScreen from './src/components/OrganizerAccountScreen';
import OrganizerDashboardScreen from './src/components/OrganizerDashboardScreen';
import ProfileScreen from './src/components/ProfileScreen';
import SettingsScreen from './src/components/SettingScreen';
import CreateEventScreen from './src/components/CreateEventScreen';
import MyEventScreen from './src/components/MyEventScreen';
import ManageEventScreen from './src/components/ManageEventScreen';
import OrganizerSignUpScreen from './src/components/OrganizerSignUpScreen';
import UserTabNavigator from './src/components/UserTabNavigator'; // ✅ NEW: Tab container for user screens
import { ThemeProvider, ThemeContext } from './src/contexts/ThemedContext';
import 'react-native-get-random-values';
import ForgotPasswordScreen from './src/components/ForgotPasswordScreen';
import WebviewScreen from './src/components/WebviewScreen';

// 1️⃣ Define your stack param list
export type RootStackParamList = {
  Home: undefined;
  Auth: undefined;
  OrganizerLogin: undefined;
  OrganizerAccount: undefined;
  OrganizerSignUp: undefined;
  OrganizerDashboard: undefined;
  CreateEvent: undefined;
  ForgotPassword: undefined;
  Profile: undefined;
  Settings: undefined;
  MyEvents: { initialTab?: 'live' | 'drafts' | 'past' } | undefined;
  ManageEvent: { eventId: string; isCollaborator?: boolean };
  WebviewScreen: { url: string };
  UserDashboard: undefined; // ✅ NEW route
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
                options={{ headerShown: true, title: 'Login' }}
              />
              <Stack.Screen
                name="OrganizerDashboard"
                component={OrganizerDashboardScreen}
                options={{
                  headerShown: true,
                  title: 'Dashboard',
                  headerBackVisible: false,
                  gestureEnabled: false,
                }}
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
              <Stack.Screen
                name="OrganizerSignUp"
                component={OrganizerSignUpScreen}
                options={{ headerShown: true, title: 'Organizer Sign Up' }}
              />
              <Stack.Screen
                name="CreateEvent"
                component={CreateEventScreen}
                options={{ headerShown: true, title: 'Create Event' }}
              />
              <Stack.Screen
                name="MyEvents"
                component={MyEventScreen}
                options={{ headerShown: true, title: 'My Events' }}
              />
              <Stack.Screen
                name="OrganizerAccount"
                component={OrganizerAccountScreen}
                options={{ headerShown: true, title: 'Account' }}
              />
              <Stack.Screen
                name="ManageEvent"
                component={ManageEventScreen}
                options={{ headerShown: true, title: 'Manage Event' }}
              />
              <Stack.Screen
                name="WebviewScreen"
                component={WebviewScreen}    // you’ll need to create this
                options={{ title: 'Map' }}
/>
              <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
                options={{ headerShown: true, title: 'Forgot Password' }}
              />
              <Stack.Screen
                name="UserDashboard"
                component={UserTabNavigator} // ✅ This is your tab screen container
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        )}
      </ThemeContext.Consumer>
    </ThemeProvider>
  );
}
