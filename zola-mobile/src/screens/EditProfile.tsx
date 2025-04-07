import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity,Modal,Pressable,TextInput } from 'react-native';
import { Icon } from 'react-native-elements';

const ProfileScreen = () => {
  const [profile, setProfile] = useState({
  name: 'Võ Phước Hậu',
  dob: '30/10/2002',
  gender: 'Nam',
});
const [form, setForm] = useState({ ...profile });
    const [modalVisible, setModalVisible] = useState(false);
      const [name, setName] = useState('Võ Phước Hậu');
  const [dob, setDob] = useState('30/10/2002');
  const [gender, setGender] = useState('Nam');
    const handleSave = () => {
    // Gửi dữ liệu cập nhật tại đây nếu cần
    toggleModal();
  };
  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };
  return (
    <ScrollView style={styles.container}>
      {/* Header Background */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://i.imgur.com/jl1L3Km.jpg' }} // Placeholder ảnh nền
          style={styles.headerImage}
        />
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: 'https://i.imgur.com/4QfKuz1.png' }} // Placeholder avatar
            style={styles.avatar}
          />
          <Text style={styles.name}>{name}</Text>
        </View>
      </View>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Nút đóng */}
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>X
          </TouchableOpacity>

          {/* Nội dung trong modal */}
          <View style={styles.modalContent}>
              <Image
              source={{ uri: 'https://i.imgur.com/4QfKuz1.png' }}
              style={styles.modalAvatar}
            />
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Họ tên"
            />
            <TextInput
              value={dob}
              onChangeText={setDob}
              style={styles.input}
              placeholder="Ngày sinh"
            />

                {/* Giới tính */}
            <View style={styles.genderRow}>
              <Pressable
                style={styles.radio}
                onPress={() => setGender('Nam')}>
                <View style={gender === 'Nam' ? styles.checkedCircle : styles.circle} />
                <Text style={styles.radioLabel}>Nam</Text>
              </Pressable>

              <Pressable
                style={styles.radio}
                onPress={() => setGender('Nữ')}>
                <View style={gender === 'Nữ' ? styles.checkedCircle : styles.circle} />
                <Text style={styles.radioLabel}>Nữ</Text>
              </Pressable>
              </View>
             <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>LƯU</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Thông tin cá nhân */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Giới tính</Text>
          <Text style={styles.value}>{gender}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Ngày sinh</Text>
          <Text style={styles.value}>{dob}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Điện thoại</Text>
          <View>
            <Text style={styles.value}>+84 899 530 610</Text>
            <Text style={styles.subtext}>
              Số điện thoại chỉ hiển thị với người có lưu số bạn trong danh bạ máy
            </Text>
          </View>
            <TouchableOpacity style={styles.editButton}  onPress={() => setModalVisible(true)}>
        <Icon name="edit" type="feather" color="#000" size={20} />
        <Text style={styles.editText}>Chỉnh sửa</Text>
      </TouchableOpacity>
        </View>
      </View>

      {/* Nút chỉnh sửa */}
    
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
  container: {
    
    backgroundColor: '#f4f4f4',
  },
  header: {
    position: 'relative',
    height: 160,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  avatarWrapper: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoSection: {
    marginTop: 0,
    padding: 20,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoRow: {
    marginBottom: 15,
  },
  label: {
    color: '#888',
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    marginTop: 2,
  },
  subtext: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  editButton: {
    marginTop:10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    height:32,
    borderRadius: 16,
  },
   genderRow: {
    flexDirection: 'row', justifyContent: 'center', marginBottom: 30,
  },
  editText: {
    fontSize: 14,
    marginLeft: 8,
  },
    radio: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20 },
  circle: {
    height: 20, width: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#aaa', marginRight: 8,
  },
  checkedCircle: {
    height: 20, width: 20, borderRadius: 10,
    backgroundColor: '#00aaff', marginRight: 8,
  },
  radioLabel: { fontSize: 16 },
  saveButton: {
    backgroundColor: '#00aaff', padding: 12, borderRadius: 30,
    alignItems: 'center',
  },
   modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalContent: { padding: 20 },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalAvatar: { width: 80, height: 80, borderRadius: 40, alignSelf: 'center', marginBottom: 20 },
  input: {
    borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 20, fontSize: 16,
  },
});

export default ProfileScreen;
