import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

const MessageActionModal = ({
  visible,
  onClose,
  onRevoke,
  onDelete,
  styles,
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
