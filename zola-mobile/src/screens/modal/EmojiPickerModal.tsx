import React from 'react';
import { Modal, View } from 'react-native';
import EmojiModal from 'react-native-emoji-modal';

const EmojiPickerModal = ({
  visible,
  onClose,
  onEmojiSelected,
  styles,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={styles.modalEmojiContainer}
        onStartShouldSetResponder={() => true}
        onResponderRelease={onClose}
      >
        <View
          style={styles.modalEmojiContent}
          onStartShouldSetResponder={() => true}
          onResponderRelease={e => e.stopPropagation()}
        >
          <EmojiModal
            visible={true}
            onClose={onClose}
            onEmojiSelected={onEmojiSelected}
          />
        </View>
      </View>
    </Modal>
  );
};

export default EmojiPickerModal;