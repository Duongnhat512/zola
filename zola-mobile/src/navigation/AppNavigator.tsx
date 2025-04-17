import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { View, Text, TouchableOpacity } from 'react-native';
// Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TabNavigator from './TabNavigator';
import OTPScreen from '../screens/OTPScreen';
import NameScreen from '../screens/RegisterNameScreen';
import PrivateInformationScreen from '../screens/PrivateInformationScreen';
import PasswordScreen from '../screens/PasswordScreen';
import Setting  from '../screens/Setting';
import EditProfile from '../screens/EditProfile';
import Profile from '../screens/Profile';
import GroupCreateScreen from '../screens/GroupCreateScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import MessagesScreen from '../screens/MessagesScreen';

// Define navigation types
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Setting: undefined;
  ProfileScreen:undefined;
  Edit:undefined;
  GroupCreate:undefined;
};

// Create navigators
const Stack = createStackNavigator<RootStackParamList>();

// Authentication Stack Navigator
const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="Name" component={NameScreen} />
      <Stack.Screen name="PrivateInformation" component={PrivateInformationScreen} />
      <Stack.Screen name="Password" component={PasswordScreen} />
     <Stack.Screen name="GroupCreate" component={GroupCreateScreen} />
    </Stack.Navigator>
  );
};

// Root Navigator
const AppNavigator: React.FC = () => {
  const user = useSelector((state: any) => state.user);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigationRef = useRef(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = user?.authenticated === true;
        console.log('Is authenticated:', authenticated);
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [user]);

  // Reset navigation state when auth changes
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && navigationRef.current) {
        // Reset to Main when authenticated
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else if (!isAuthenticated && navigationRef.current) {
        // Reset to Welcome when not authenticated
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      }
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="ProfileScreen" component={Profile} 
          />
          <Stack.Screen name="Edit" component={EditProfile} />
          <Stack.Screen name="Setting" component={Setting} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Messages" component={MessagesScreen} />
          <Stack.Screen name="ChatRoom" component={ChatRoomScreen} /> 
          <Stack.Screen name="GroupCreate" component={GroupCreateScreen} />
        </Stack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
