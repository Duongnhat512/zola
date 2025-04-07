import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TabNavigator from './TabNavigator';
import { useSelector } from 'react-redux';
import OTPScreen from '../screens/OTPScreen';
import NameScreen from '../screens/RegisterNameScreen';
import PrivateInformationScreen from '../screens/PrivateInformationScreen';
import PasswordScreen from '../screens/PasswordScreen';

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
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="Name" component={NameScreen} />
      <Stack.Screen name="PrivateInformation" component={PrivateInformationScreen} />
      <Stack.Screen name="Password" component={PasswordScreen} />
    </Stack.Navigator>
  );
};

// Root Navigator
const AppNavigator: React.FC = () => {
  // const [isLoggedIn, setIsLoggedIn] = useState(user);
  const user = useSelector((state: any) => state.user);

  const handleLoginChange = (status: boolean) => {
    setIsLoggedIn(status);
  };
  
  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={TabNavigator} />
        </Stack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
