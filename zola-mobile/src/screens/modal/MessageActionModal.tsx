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
          <TouchableOpacity onPress={()=>{
            navigation.navigate('Forward',{message:message,conversations:conversations});
          }}>
            <Text style={styles.modalOptionText}>Chuyển tiếp</Text>
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
