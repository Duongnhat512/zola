import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import styles from '../styles/MessagesScreen.styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MessagesScreen = () => {
  const [activeTab, setActiveTab] = useState('priority'); // 'priority' or 'other'

  const chats = [

  ]

  // useEffect(async () => {
  //   const accessToken = await AsyncStorage.getItem("accessToken")
  //   console.log(accessToken)
  // }, []);

  const renderChatItem = ({ item }) => (
    <View style={styles.chatItem}>
      <Text>{item.name}</Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0068FF" barStyle="light-content" />

      {/* Header with search bar */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={22} color="#FFFFFF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm"
            placeholderTextColor="#FFFFFF"
          />
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="qr-code-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'priority' && styles.activeTab]}
          onPress={() => setActiveTab('priority')}
        >
          <Text style={[styles.tabText, activeTab === 'priority' && styles.activeTabText]}>Ưu tiên</Text>
          {activeTab === 'priority' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'other' && styles.activeTab]}
          onPress={() => setActiveTab('other')}
        >
          <Text style={[styles.tabText, activeTab === 'other' && styles.activeTabText]}>Khác</Text>
        </TouchableOpacity>

        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <Feather name="filter" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat list */}
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatList}
      />
    </SafeAreaView>
  );
};

export default MessagesScreen; 