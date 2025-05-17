import React from 'react';
import { Modal, View, Image, TouchableOpacity } from 'react-native';

const ImagePreviewModal = ({ visible, imageUri, onClose, styles }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity onPress={onClose} style={styles.modalVideoContainer}>
        <View style={styles.previewVideoContainer}>
          <TouchableOpacity activeOpacity={1}>
            <Image
              source={{ uri: imageUri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default ImagePreviewModal;