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
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  messageContainer: {
    marginVertical: 6,
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
    backgroundColor: '#FFF',
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
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
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
  }
  
});

export default styles;
