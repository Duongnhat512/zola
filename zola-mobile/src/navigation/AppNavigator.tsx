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
import Setting  from '../screens/Setting';
import EditProfile from '../screens/EditProfile';
import Profile from '../screens/Profile';

// Define navigation types
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Setting: undefined;
  ProfileScreen:undefined;
  Edit:undefined;
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
      <Stack.Screen name="ProfileScreen" component={Profile} />
      <Stack.Screen name="Edit" component={EditProfile} />
      <Stack.Screen name="Setting" component={Setting} />
    </Stack.Navigator>
  );
};

// Root Navigator
const AppNavigator: React.FC = () => {
  // const [isLoggedIn, setIsLoggedIn] = useState(user);
  const user = useSelector((state: any) => state.user);

  // const handleLoginChange = (status: boolean) => {
  //   setIsLoggedIn(status);
  // };
  
  return (
    <NavigationContainer>
      {/* {user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ProfileScreen" component={Profile} />
          <Stack.Screen name="Edit" component={EditProfile} />
          <Stack.Screen name="Setting" component={Setting} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
        </Stack.Navigator>
      ) : ( */}
        <AuthStack />
      {/* )} */}
    </NavigationContainer>
  );
};

export default AppNavigator;
