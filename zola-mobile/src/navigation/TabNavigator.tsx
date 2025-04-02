import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import styles from '../styles/TabNavigator.styles';

// Import the actual MessagesScreen
import MessagesScreen from '../screens/MessagesScreen';

// Placeholder screens
import { View, Text } from 'react-native';

const ContactsScreen = () => (
  <View style={styles.container}>
    <Text>Danh bạ</Text>
  </View>
);

const GroupsScreen = () => (
  <View style={styles.container}>
    <Text>Nhóm</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={styles.container}>
    <Text>Cá nhân</Text>
  </View>
);

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Messages"
      screenOptions={{
        tabBarActiveTintColor: '#0068FF',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: styles.tabBar,
        headerShown: false,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Tin nhắn',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message-text" color={color} size={28} style={styles.tabIcon} />
          ),
        }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{
          tabBarLabel: 'Danh bạ',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="address-book" color={color} size={24} style={styles.tabIcon} />
          ),
        }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupsScreen}
        options={{
          tabBarLabel: 'Nhóm',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" color={color} size={24} style={styles.tabIcon} />
          ),
          // tabBarBadge: 2,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Cá nhân',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={24} style={styles.tabIcon} />
          ),
          // tabBarBadge: 1,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
