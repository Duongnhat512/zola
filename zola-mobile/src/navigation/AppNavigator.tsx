import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TabNavigator from './TabNavigator';

// Define navigation types
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
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
    </Stack.Navigator>
  );
};

// Root Navigator
const AppNavigator: React.FC = () => {
  // For demo purposes, you can change this to true to show the main screen directly
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Automatically get login status from login screen
  const handleLoginChange = (status: boolean) => {
    setIsLoggedIn(status);
  };
  
  return (
    <NavigationContainer>
      {/* {isLoggedIn ? ( */}
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={TabNavigator} />
        </Stack.Navigator>
      {/* ) : (
        <AuthStack />
      )} */}
    </NavigationContainer>
  );
};

export default AppNavigator;
