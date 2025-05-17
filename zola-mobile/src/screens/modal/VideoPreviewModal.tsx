import React from 'react';
import { Modal, View, TouchableOpacity } from 'react-native';
import { Video } from 'expo-av';

const VideoPreviewModal = ({ visible, videoUri, onClose, styles }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity onPress={onClose} style={styles.modalVideoContainer}>
        <View style={styles.previewVideoContainer}>
          <TouchableOpacity activeOpacity={1}>
            <Video
              source={{ uri: videoUri }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode="contain"
              useNativeControls
              style={styles.previewImage}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default VideoPreviewModal;