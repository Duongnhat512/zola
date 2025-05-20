import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

const MessageActionModal = ({
  visible,
  onClose,
  onRevoke,
  onDelete,
  styles,
  navigation,
  message,
  conversations,
  onPin,
  disablePin, // nhận prop này
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlayBackground}>
        <View style={styles.modalContent}>

          <TouchableOpacity
            onPress={() => {
              onRevoke();
              onClose();
            }}
          >
            <Text style={styles.modalOptionText}>Thu hồi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              onClose();
              navigation.navigate('Forward', { message, conversations });
            }}
          >
            <Text style={styles.modalOptionText}>Chuyển tiếp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (!disablePin) {
                onPin();
                onClose();
              }
            }}
            disabled={disablePin}
            style={disablePin ? { opacity: 0.5 } : null}
          >
            <Text style={styles.modalOptionText}>
              {disablePin ? 'Đã ghim' : 'Ghim tin nhắn'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              onDelete();
              onClose();
            }}
          >
            <Text style={styles.modalOptionText}>Xóa ở phía bạn</Text>
          </TouchableOpacity>
          
  
          
            
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalOptionText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
export default MessageActionModal;
