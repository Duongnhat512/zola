import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Modal, StyleSheet, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const dummyFriends = [
  { id: '1', fullname: 'Hiệp Võ', avatar: { uri: 'https://randomuser.me/api/portraits/men/1.jpg' } },
  { id: '2', fullname: 'Ngô Quốc Đạt', avatar: { uri: 'https://randomuser.me/api/portraits/men/2.jpg' } },
  { id: '3', fullname: 'Khang Đình', avatar: { uri: 'https://randomuser.me/api/portraits/men/3.jpg' } },
  { id: '4', fullname: 'Bảo', avatar: { uri: 'https://randomuser.me/api/portraits/men/4.jpg' } },
  { id: '5', fullname: 'Phạm Minh Châu', avatar: { uri: 'https://randomuser.me/api/portraits/women/5.jpg' } },
];

export default function GroupCreateScreen() {
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [groupName, setGroupName] = useState('');

  const toggleSelectFriend = (friend) => {
    const exists = selectedFriends.some(f => f.id === friend.id);
    if (exists) {
      setSelectedFriends(selectedFriends.filter(f => f.id !== friend.id));
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const pickGroupImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setGroupAvatar({ uri: result.assets[0].uri });
    }
  };

  const renderFriend = ({ item }) => {
    const isSelected = selectedFriends.some(f => f.id === item.id);
    return (
      <TouchableOpacity style={styles.friendRow} onPress={() => toggleSelectFriend(item)}>
        <Image source={item.avatar} style={styles.avatar} />
        <Text style={styles.fullname}>{item.fullname}</Text>
        <View style={[styles.checkbox, isSelected && styles.checked]} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.groupImagePicker} onPress={pickGroupImage}>
        {groupAvatar ? (
          <Image source={groupAvatar} style={styles.groupImage} />
        ) : (
          <Text style={styles.addImageText}>Chọn ảnh nhóm</Text>
        )}
      </TouchableOpacity>

      <TextInput
        placeholder="Nhập tên nhóm"
        style={styles.groupNameInput}
        value={groupName}
        onChangeText={setGroupName}
      />

      <TextInput placeholder="Tìm tên hoặc số điện thoại" style={styles.searchInput} />

      <FlatList
        data={dummyFriends}
        keyExtractor={(item) => item.id}
        renderItem={renderFriend}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {selectedFriends.length > 0 && (
        <View style={styles.modalBottom}>
          <View style={styles.selectedAvatars}>
            {selectedFriends.map((f) => (
              <Image key={f.id} source={f.avatar} style={styles.selectedAvatar} />
            ))}
          </View>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => console.log('Tạo nhóm:', groupName, 'với:', selectedFriends)}>
            <Text style={styles.createButtonText}>Tạo nhóm</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  groupImagePicker: {
    alignSelf: 'center',
    marginBottom: 8
  },
  groupImage: {
    width: 80,
    height: 80,
    borderRadius: 40
  },
  addImageText: {
    fontSize: 16,
    color: '#999'
  },
  groupNameInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee'
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10
  },
  fullname: {
    flex: 1,
    fontSize: 16
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc'
  },
  checked: {
    backgroundColor: '#3498db',
    borderColor: '#3498db'
  },
  modalBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  selectedAvatars: {
    flexDirection: 'row',
    flex: 1
  },
  selectedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});
