import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import styles from '../styles/TabNavigator.styles';
import { logout } from '../redux/slices/UserSlice';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Text,
  Modal,
  Pressable, ScrollView
} from 'react-native';
import { MaterialIcons, Entypo, Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const COVER_HEIGHT = 200;
const AVATAR_SIZE = 100;

const Setting = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const handleLogout = () => {
    dispatch(logout()); // gọi logout trong Redux
  };
  return (
    <ScrollView>
            <View style={styles.topLeftIcons}>
              <TouchableOpacity style={styles.iconButton} onPress={() =>navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={24} color="#000000" />
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
              </View>
      <View style={{ gap: 10 }}>
        <View>
          <View style={styles.row}>
            <Image
              source={require('../assets/zalo-icon/shield.png')}
              style={styles.icon2}
            />
            <View style={styles.middle}>
              <Text style={styles.text}>Dữ liệu trên máy</Text>
            </View>
            <Image
              source={require("../assets/zalo-icon/ic_back_modal.png")}
              style={styles.icon}
            />
          </View>
          <View style={styles.row}>
            <Image
              source={require('../assets/zalo-icon/shield.png')}
              style={styles.icon2}
            />
            <View style={styles.middle}>
              <Text style={styles.text}>Sao lưu và khôi phục</Text>
            </View>
            <Image
              source={require("../assets/zalo-icon/ic_back_modal.png")}
              style={styles.icon}
            />
          </View>
        </View>
        <View>
          <View style={styles.row2}>
            <Image
              source={require("../assets/zalo-icon/clouldZ.png")}
              style={styles.icon2}
            />
            <View style={styles.middle}>
              <Text style={styles.text}>Thông báo</Text>
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
              <Text style={styles.text}>Tin nhắn</Text>
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
              <Text style={styles.text}>Thông báo</Text>
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
              <Text style={styles.text}>Tin nhắn</Text>
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
              <Text style={styles.text}>Cuộc gọi</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Image
              source={require('../assets/zalo-icon/shield.png')}
              style={styles.icon2}
            />
            <View style={styles.middle}>
              <Text style={styles.text}>Nhật ký</Text>
            </View>
            <Image
              source={require("../assets/zalo-icon/ic_back_modal.png")}
              style={styles.icon}
            />
          </View>
          <View style={styles.row}>
            <Image
              source={require('../assets/zalo-icon/shield.png')}
              style={styles.icon2}
            />
            <View style={styles.middle}>
              <Text style={styles.text}>Danh bạ</Text>
            </View>
            <Image
              source={require("../assets/zalo-icon/ic_back_modal.png")}
              style={styles.icon}
            />
          </View>
          <View style={styles.row}>
            <Image
              source={require('../assets/zalo-icon/shield.png')}
              style={styles.icon2}
            />
            <View style={styles.middle}>
              <Text style={styles.text}>Giao diện và ngôn ngữ</Text>
            </View>
            <Image
              source={require("../assets/zalo-icon/ic_back_modal.png")}
              style={styles.icon}
            />
          </View>
        </View>
        <View>
          <View style={styles.row}>
            <Image
              source={require("../assets/zalo-icon/shield.png")}
              style={styles.icon2}
            />
            <View style={styles.middle}>
              <Text style={styles.text}>Thông tin về Zalo</Text>
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
              <Text style={styles.text}>Liên hệ hỗ trợ</Text>
            </View>
            <Image
              source={require("../assets/zalo-icon/ic_back_modal.png")}
              style={styles.icon}
            />
          </View>
        </View>
        <View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default Setting;
