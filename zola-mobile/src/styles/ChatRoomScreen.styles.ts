import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  backButton: {
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 20,
    color: '#007BFF',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  messageList: {
    padding: 10,
  },
 


  messageContent: {
    flexDirection: 'column',
    marginLeft: 10, // Khoảng cách giữa avatar và nội dung tin nhắn
  },




  footerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  fileButton: {
    marginRight: 10,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
  },
  sendButton: {
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 20,
    marginLeft: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  messageWrapper: {
    marginBottom: 10,
    maxWidth: '80%',
  },
  
  alignStart: {
    alignSelf: 'flex-start',
  },
  
  alignEnd: {
    alignSelf: 'flex-end',
  },
  
  avatarAndNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  


 

  
  messageText: {
    fontSize: 14,
    color: '#333',
  },
  
  messageTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  
  mediaPreview: {
    maxWidth: 250,         // Giới hạn chiều ngang khung chat
    maxHeight: 250,        // Giới hạn chiều cao để không quá to
    width: '100%',         // Chiếm toàn bộ chiều rộng khung chứa
    height: undefined,     // Cho phép tự tính chiều cao
    aspectRatio: 1 ,     // Tỉ lệ khung hình 1:1  
    resizeMode: 'contain', // Giữ đúng tỉ lệ ảnh
    borderRadius: 12,
  },
  messageContainer: {
    marginVertical: 6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  squareImageWrapper: {
    width: 300,
    height: 300,
    backgroundColor: '#ccc',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  squareImage: {
    width: '100%',
    height: '100%',
  },
  
  closeOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  
  

  
  alignLeft: {
    alignSelf: 'flex-start',
  },
  
  alignRight: {
    alignSelf: 'flex-end',
  },
  

  messageBubble: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  
  myMessage: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
  },
  
  theirMessage: {
    backgroundColor: '#ccc',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 4,
  },
  
  rowNormal: {
    alignSelf: 'flex-start',
    flexDirection: 'row', // avatar trái, tên phải
  },
  
  rowReverse: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse', // avatar phải, tên trái
  },
  
  avatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  
  senderName: {
    fontSize: 13,
    color: '#555',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalButton: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
  },deletedMessage: {
    borderWidth: 1,
    borderColor: '#black',
    backgroundColor: 'black',
    padding: 8,
    borderRadius: 12,
    marginTop: 4,
    maxWidth: '80%',
  },
  
  deletedText: {
    fontStyle: 'italic',
    color: 'gray',
    fontSize: 14,
  },
  modalEmojiContainer: {
    flex: 1,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Màu nền tối mờ để modal nổi bật
  },
  emojiModal: {
    backgroundColor: 'white', // Nền của modal
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%', // Giới hạn chiều cao modal
    width: '90%', // Chiếm gần hết chiều rộng màn hình
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    backgroundColor: '#FF6347', // Màu đỏ
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  emojiList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  emojiImage: {
    width: 40,
    height: 40,
    margin: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 5,
    backgroundColor: '#f0f0f0',
  
  },
  emojiImageHovered: {
    transform: [{ scale: 1.2 }], // Phóng to khi hover
  },
  emojiButtonText: {
    fontSize: 25,
    color: '#007BFF',
  },
  overlayBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Nền mờ
  },
  
  // Định dạng vùng nội dung modal
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  
  // Định dạng cho các tùy chọn trong modal
  modalOptionText: {
    fontSize: 16,
    color: '#007BFF', // Màu xanh cho các lựa chọn
    paddingVertical: 10,
    textAlign: 'center',
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  previewFileName: {
    marginBottom: 5,
    fontSize: 14,
    color: '#555',
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  cancelPreviewButton: {
    marginTop: 5,
  },
  cancelPreviewText: {
    color: 'red',
    fontSize: 14,
  },
  
});

export default styles;
