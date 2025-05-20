import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const PinnedMessagePanel = ({ pinnedMessages,onSelectMessage, onUnpinMessage }) => {
  const [showAll, setShowAll] = useState(false);

  if (!pinnedMessages || pinnedMessages.length === 0) return null;

  const visibleMessages = showAll ? pinnedMessages : [pinnedMessages[0]];

   const renderItem = ({ item }) => (
  <TouchableOpacity
    onPress={() => onSelectMessage(item.id)}
    style={{
      backgroundColor: '#fff',
      padding: 10,
      borderRadius: 8,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    }}
  >
    <View style={{ flex: 1 }}>
      <Text style={{ fontWeight: '500', color: '#333' }}>{item.senderName}</Text>
      <Text style={{ color: '#666', marginTop: 2 }}>{item.text}</Text>
    </View>

    <TouchableOpacity
      onPress={(e) => {
        e.stopPropagation(); // ngăn không cho sự kiện onPress của cha chạy
        onUnpinMessage(item.id); // hàm bạn truyền xuống để bỏ ghim
      }}
      style={{ padding: 5 }}
    >
      <MaterialIcons
        name="push-pin"
        size={20}
        color="#007bff"
      />
    </TouchableOpacity>
  </TouchableOpacity>
);

  return (
    <View
      style={{
        padding: 12,
        backgroundColor: '#f0f4f8',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#dcdcdc',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            fontWeight: '600',
            fontSize: 12,
            color: '#333',
          }}
        >
          📌 Tin nhắn đã ghim:
        </Text>

        {pinnedMessages.length > 1 && (
          <TouchableOpacity onPress={() => setShowAll(!showAll)}>
            <Text style={{ color: '#007bff', fontWeight: '500' }}>
              {showAll ? 'Thu gọn' : 'Xem thêm'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={visibleMessages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default PinnedMessagePanel;
