import React, { useState } from 'react';
import styles from '../styles/TabNavigator.styles';

import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Text,
  Modal,
  Pressable,ScrollView
} from 'react-native';
import { MaterialIcons, Entypo, Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const COVER_HEIGHT = 200;
const AVATAR_SIZE = 100;

const Setting = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
 <ScrollView>
 <View style={{gap:10}}>  
  <View>
      <View style={styles.row}>
      <Image
        source={require('./zalo-icon/shield.png')}
        style={styles.icon2}
      />
      <View style={styles.middle}>
        <Text style={styles.text}>Dữ liệu trên máy</Text>
              </View>
     <Image
        source={require("./ic_back_modal.png")}
        style={styles.icon}
      />
      </View>
       <View style={styles.row}>
      <Image
        source={require('./zalo-icon/shield.png')}
        style={styles.icon2}
      />
      <View style={styles.middle}>
        <Text style={styles.text}>Sao lưu và khôi phục</Text>
              </View>
     <Image
        source={require("./ic_back_modal.png")}
        style={styles.icon}
      />
      </View>
      </View>
      <View>
       <View style={styles.row2}>
      <Image
        source={require("./zalo-icon/clouldZ.png")}
        style={styles.icon2}
      />
      <View style={styles.middle}>
        <Text style={styles.text}>Thông báo</Text>
      </View>
      <Image
        source={require("./ic_back_modal.png")}
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
        source={require("./zalo-icon/cloud.png")}
        style={styles.icon2}
      />
      <View style={styles.middle}>
        <Text style={styles.text}>Thông báo</Text>
      </View>
      <Image
        source={require("./ic_back_modal.png")}
        style={styles.icon}
      />
      </View>
       <View style={styles.row2}>
      <Image
        source={require("./zalo-icon/pie.png")}
        style={styles.icon2}
      />
      <View style={styles.middle}>
        <Text style={styles.text}>Tin nhắn</Text>
      </View>
      <Image
        source={require("./ic_back_modal.png")}
        style={styles.icon}
      />
      </View>
       <View style={styles.row2}>
      <Image
        source={require("./zalo-icon/qr.png")}
        style={styles.icon2}
      />
      <View style={styles.middle}>
        <Text style={styles.text}>Cuộc gọi</Text>
      </View>
      </View>
       <View style={styles.row}>
      <Image
        source={require('./zalo-icon/shield.png')}
        style={styles.icon2}
      />
      <View style={styles.middle}>
        <Text style={styles.text}>Nhật ký</Text>
              </View>
     <Image
        source={require("./ic_back_modal.png")}
        style={styles.icon}
      />
      </View>
       <View style={styles.row}>
      <Image
        source={require('./zalo-icon/shield.png')}
        style={styles.icon2}
      />
      <View style={styles.middle}>
        <Text style={styles.text}>Danh bạ</Text>
              </View>
     <Image
        source={require("./ic_back_modal.png")}
        style={styles.icon}
      />
      </View>
       <View style={styles.row}>
      <Image
        source={require('./zalo-icon/shield.png')}
        style={styles.icon2}
      />
      <View style={styles.middle}>
        <Text style={styles.text}>Giao diện và ngôn ngữ</Text>
              </View>
     <Image
        source={require("./ic_back_modal.png")}
        style={styles.icon}
      />
      </View>
      </View>
      <View>
       <View style={styles.row}>
      <Image
        source={require("./zalo-icon/shield.png")}
        style={styles.icon2}
      />
      <View style={styles.middle}>
        <Text style={styles.text}>Thông tin về Zalo</Text>
      </View>
      <Image
        source={require("./ic_back_modal.png")}
        style={styles.icon}
      />
      </View>
       <View style={styles.row}>
      <Image
        source={require("./zalo-icon/lock.png")}
        style={styles.icon2}
      />
      <View style={styles.middle}>
        <Text style={styles.text}>Liên hệ hỗ trợ</Text>
      </View>
      <Image
        source={require("./ic_back_modal.png")}
        style={styles.icon}
      />
      </View>
      </View>
      <View>
      <TouchableOpacity style={styles.logoutButton} onPress={() => console.log('Đăng xuất')}>
  <Text style={styles.logoutText}>Đăng xuất</Text>
</TouchableOpacity>
      </View>
      </View>
  </ScrollView>
  );
};

export default Setting;
