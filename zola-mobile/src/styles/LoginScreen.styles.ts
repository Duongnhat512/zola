import { StyleSheet, Platform, StatusBar } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#07a6e6',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  backButton: {
    marginRight: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  instructionContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    color: '#333',
  },
  form: {
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    fontSize: 16,
    paddingVertical: 8,
    color: '#000',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    color: '#000',
  },
  underline: {
    height: 1,
    backgroundColor: '#c7c9c8',
    marginTop: 2,
  },
  activeUnderline: {
    backgroundColor: '#07a6e6',
  },
  showHideButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  showHideButtonText: {
    color: '#666',
    fontSize: 14,
  },
  forgotPasswordButton: {
    marginTop: 15,
  },
  forgotPasswordText: {
    color: '#07a6e6',
    fontSize: 14,
    fontWeight: 'bold',
  },
  faqContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 30,
  },
  faqButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  faqButtonText: {
    color: '#666',
    fontSize: 14,
  },
  faqButtonIcon: {
    color: '#666',
    fontSize: 14,
    marginLeft: 5,
  },
  nextButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#c7c9c8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonActive: {
    backgroundColor: '#07a6e6',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default styles; 