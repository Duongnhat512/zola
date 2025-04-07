import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Text,
  Modal,
  Pressable,
} from 'react-native';
import { MaterialIcons, Entypo, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const { width, height } = Dimensions.get('window');
const COVER_HEIGHT = 200;
const AVATAR_SIZE = 100;

const Profile = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const user = useSelector((state: any) => state.user.user);

  return (
    <View style={styles.container}>
      {/* Ảnh bìa */}
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1503264116251-35a269479413' }}
        style={styles.coverPhoto}
      />

      {/* Góc phải: icon đồng hồ và ... */}
      <View style={styles.topRightIcons}>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="access-time" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() =>navigation.navigate("Edit")}>
          <Entypo name="dots-three-horizontal" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: user?.avt }}
          style={styles.avatar}
        />
      </View>

      {/* Phần dưới */}
      <View style={styles.bottomSection}>
        <Text style={styles.username}>{user.fullname}</Text>
      </View>

      {/* Modal full màn hình */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Nút đóng */}
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Ionicons name="close" size={28} color="#000" />
          </TouchableOpacity>

          {/* Nội dung trong modal */}
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18 }}>Menu hành động hoặc cài đặt ở đây</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  coverPhoto: {
    width: '100%',
    height: COVER_HEIGHT,
  },
  topRightIcons: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 12,
    zIndex: 20,
  },
  iconButton: {
    padding: 6,
  },
  avatarContainer: {
    position: 'absolute',
    top: COVER_HEIGHT - AVATAR_SIZE / 2,
    left: width / 2 - AVATAR_SIZE / 2,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'hidden',
    backgroundColor: '#fff',
    zIndex: 10,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: AVATAR_SIZE / 2 + 12,
    alignItems: 'center',
  },
  username: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
    color: '#141415',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 48,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 20,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Profile;
