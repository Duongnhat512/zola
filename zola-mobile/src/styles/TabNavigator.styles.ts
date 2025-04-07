import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    
  },
  tabLabel: {
    fontSize: 12,
  },
  tabIcon:{
    marginBottom: -3,
  },
  row: {
    backgroundColor:"#ffffff",
    height: 48,
    width: '100%',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Nếu bạn dùng React Native >= 0.71
  },
    row2: {
    backgroundColor:"#ffffff",
    height: 64,
    width: '100%',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Nếu bạn dùng React Native >= 0.71
  },
   row3: {
    backgroundColor:"#006AF5",
    height: 48,
    width: '100%',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Nếu bạn dùng React Native >= 0.71
  },
    text: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0,
    color: '#141415',
    textAlignVertical: 'center', // vertical alignment middle
  },
   text3: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0,
    color: '#ffffff',
    textAlignVertical: 'center', // vertical alignment middle
  },
   text2: {
    fontFamily: 'Roboto',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
    color: '#767A7F',
    textAlignVertical: 'center', // vertical alignment middle
  },
  icon2: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
    avatar: {
    width: 36,
    height: 36,
    borderRadius:18,
    resizeMode: 'contain',
  },
   icon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
  },
    middle: {
    flex: 1,
    marginHorizontal: 8,
    justifyContent: 'center',
  },
  logoutButton: {
  backgroundColor: '#007BFF', // màu xanh
  height: 48,
  paddingHorizontal: 24,
  paddingVertical: 12,
  borderRadius: 8,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 24, // hoặc tùy chỉnh vị trí
},
logoutText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '500',
},
});

export default styles; 