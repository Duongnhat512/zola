import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  bodyContainer: {
    flex: 1,
    backgroundColor: '#CCCCCC',
  },
    footerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor:'#50B6F1'
  },
  backButton: {
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 20,
    color:'#ffffff',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color:'#ffffff',
    flex: 1,
  },
  messageList: {
  },
 


  messageContent: {
    flexDirection: 'column',
    marginLeft: 10, // Khoảng cách giữa avatar và nội dung tin nhắn
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
    //borderWidth: 1,
    borderColor: '#ccc',
    // borderRadius: 20,
  },
  sendButton: {
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 20,
    paddingHorizontal: 20,
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

  
  modalVideoContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  previewVideoContainer: {
    width: '90%',
    maxHeight: '90%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  previewImage: {
    width: '100%',
    aspectRatio: 1, // để ảnh hiển thị hình vuông
    borderRadius: 10,
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
   deletedMessage: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 10,
    borderColor: 'black',
    borderWidth: 2,
  },

  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 10,
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
  },

  
  deletedText: {
    fontStyle: 'italic',
    color: 'gray',
    fontSize: 14,
  },

  modalEmojiContainer: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'center',
  alignItems: 'center',
},
  modalEmojiContent: {
    backgroundColor: '#fff',
    maxHeight: '50%',
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

  previewFileName: {
    marginBottom: 5,
    fontSize: 14,
    color: '#555',
  },

  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    backgroundColor: '#ccc',
  },
  

  cancelPreviewButton: {
    backgroundColor: 'red',  
    padding: 10,
    borderRadius: 5,
  },
  
  cancelPreviewText: {
    color: 'white',
    fontSize: 14,
  },
  notifyContainer: {
    alignSelf: 'center',
    backgroundColor: '#e0e0e0', // màu xám
    padding: 8,
    borderRadius: 12,
    marginVertical: 5,
    maxWidth: '80%',
  },
  
  notifyText: {
    color: 'darkcyan',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  
  
});

export default styles;
