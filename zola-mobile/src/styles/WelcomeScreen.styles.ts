import { StyleSheet, Dimensions } from 'react-native';

// Get device dimensions
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    width: width,
    height: height,
    backgroundColor: '#fff',
  },
  qrButton: {
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#4caf50',
  padding: 12,
  borderRadius: 10,
  marginTop: 10,
},

qrIcon: {
  width: 32,
  height: 32,
  tintColor: 'white', // nếu ảnh là đen trắng
},

  container: {
    flex: 1,
  },
  languageSelector: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 40,
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 5,
  },
  arrowDown: {
    fontSize: 12,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0068FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoZ: {
    width: 40,
    height: 40,
    position: 'relative',
  },
  zTop: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 30,
    height: 6,
    backgroundColor: 'white',
  },
  zDiagonal: {
    position: 'absolute',
    width: 40,
    height: 6,
    backgroundColor: 'white',
    top: 17,
    left: 0,
    transform: [{ rotate: '-30deg' }],
  },
  zBottom: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    width: 30,
    height: 6,
    backgroundColor: 'white',
  },
  logoText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#0068FF',
    letterSpacing: 1,
  },
  paginationContainer: {
    flexDirection: 'row',
    marginBottom: 80,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D8D8D8',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#0068FF',
  },
  buttonContainer: {
    padding: 20,
    width: '100%',
  },
  loginButton: {
    backgroundColor: '#0068FF',
    borderRadius: 40,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 40,
    paddingVertical: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '500',
  },
});

export default styles; 