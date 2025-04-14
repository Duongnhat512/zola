import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import styles from '../styles/TabNavigator.styles';
import { useNavigation } from '@react-navigation/native';
import ContactScreen from '../screens/ContactScreen';
// Import the actual MessagesScreen
import MessagesScreen from '../screens/MessagesScreen';

// Placeholder screens
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { TextInput } from 'react-native-gesture-handler';

const ContactsScreen = () => (
  <ContactScreen/>
);

const GroupsScreen = () => (
  <View style={styles.container}>
    <Text>Nhóm</Text>
  </View>
);

const ProfileScreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state: any) => state.user.user);
  return (
    <View style={{ gap: 10 }}>
      <View style={styles.row3}>
        <Image
          source={require("../assets/zalo-icon/search.png")}
          style={styles.icon2}
        />
        <View style={styles.middle}>
          
          <Text style={styles.text3}>Tìm kiếm</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Setting')}>
          <Image
            source={require("../assets/zalo-icon/setting.png")}
            style={styles.icon2}
          />
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity style={styles.row2} onPress={() => navigation.navigate('ProfileScreen')}>
          <Image
            source={{ uri: user?.avt }}
            style={styles.avatar}
          />
          <View style={styles.middle}>
            <Text style={styles.text}>{user?.fullname}</Text>
            <Text style={styles.text2}>Xem trang cá nhân</Text>
          </View>
          <Image
            source={require("../assets/zalo-icon/avatar.png")}
            style={styles.icon2}
          />
        </TouchableOpacity>
      </View>
      <View>
        <View style={styles.row2}>
          <Image
            source={require("../assets/zalo-icon/clouldZ.png")}
            style={styles.icon2}
          />
          <View style={styles.middle}>
            <Text style={styles.text}>zCloud</Text>
            <Text style={styles.text2}>không gian lưu trữ dữ liệu trên đám mây</Text>
          </View>
          <Image
            source={require("../assets/zalo-icon/ic_back_modal.png")}
            style={styles.icon}
          />
        </View>
        <View style={styles.row2}>
          <Image
            source={{ uri: 'https://img.icons8.com/ios-filled/50/user.png' }}
            style={styles.icon}
          />
          <View style={styles.middle}>
            <Text style={styles.text}>zStyle - Nổi bật trên Zalo</Text>
            <Text style={styles.text2}>Hình nền và nhạc cho cuộc gọi Zalo</Text>
          </View>
        </View>
      </View>
      <View>
        <View style={styles.row2}>
          <Image
            source={require("../assets/zalo-icon/cloud.png")}
            style={styles.icon2}
          />
          <View style={styles.middle}>
            <Text style={styles.text}>Cloud của tôi</Text>
            <Text style={styles.text2}>Lưu trữ các tin nhắn quan trọng</Text>
          </View>
          <Image
            source={require("../assets/zalo-icon/ic_back_modal.png")}
            style={styles.icon}
          />
        </View>
        <View style={styles.row2}>
          <Image
            source={require("../assets/zalo-icon/pie.png")}
            style={styles.icon2}
          />
          <View style={styles.middle}>
            <Text style={styles.text}>Dữ liệu trên máy</Text>
            <Text style={styles.text2}>Quản lý dữ liệu Zalo của bạn</Text>
          </View>
          <Image
            source={require("../assets/zalo-icon/ic_back_modal.png")}
            style={styles.icon}
          />
        </View>
        <View style={styles.row2}>
          <Image
            source={require("../assets/zalo-icon/qr.png")}
            style={styles.icon2}
          />
          <View style={styles.middle}>
            <Text style={styles.text}>Ví QR</Text>
            <Text style={styles.text2}>Lưu trữ và xuất trình các mã QR quan trọng</Text>
          </View>
        </View>
      </View>
      <View>
        <View style={styles.row}>
          <Image
            source={require("../assets/zalo-icon/shield.png")}
            style={styles.icon2}
          />
          <View style={styles.middle}>
            <Text style={styles.text}>Tài khoản và bảo mật</Text>
          </View>
          <Image
            source={require("../assets/zalo-icon/ic_back_modal.png")}
            style={styles.icon}
          />
        </View>
        <View style={styles.row}>
          <Image
            source={require("../assets/zalo-icon/lock.png")}
            style={styles.icon2}
          />
          <View style={styles.middle}>
            <Text style={styles.text}>Quyền riêng tư</Text>
          </View>
          <Image
            source={require("../assets/zalo-icon/ic_back_modal.png")}
            style={styles.icon}
          />
        </View>
      </View>
    </View>
  );
}

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
