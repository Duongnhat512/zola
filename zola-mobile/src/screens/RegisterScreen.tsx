import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

type RegisterScreenProps = {
  navigation: any;
};

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const validatePhoneNumber = (number: string) => {
  const regex = /^(\+84|84|0)(3[2-9]|5[689]|7[06-9]|8[1-689]|9[0-46-9])[0-9]{7}$/;
  return regex.test(number);
};

  const handleRegister = () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError('Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng.');
      return;
    }
    setPhoneError('');
    setShowOTPModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.placeholder} />
        </View>

        <Text style={styles.headerTitle}>Nhập số điện thoại</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Số điện thoại"
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              setPhoneError('');
            }}
            keyboardType="phone-pad"
          />
          {phoneError ? (
            <Text style={{ color: 'red', marginBottom: 10 }}>{phoneError}</Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.registerButton,
              phoneNumber?.trim() && checked1 && checked2
                ? styles.registerButtonActive
                : null
            ]}
            disabled={!phoneNumber || !checked1 || !checked2}
            onPress={handleRegister}
          >
            <Text style={styles.registerButtonText}>Đăng ký</Text>
          </TouchableOpacity>

          <View style={styles.termsRow}>
            <Pressable onPress={() => setChecked1(!checked1)} style={styles.checkbox}>
              {checked1 && <Text style={styles.checkmark}>✔</Text>}
            </Pressable>
            <Text style={styles.label}>
              Tôi đồng ý với
              <Text style={styles.link} onPress={() => alert('Điều khoản')}>
                {' '}điều khoản sử dụng Zola
              </Text>
            </Text>
          </View>

          <View style={styles.termsRow}>
            <Pressable onPress={() => setChecked2(!checked2)} style={styles.checkbox}>
              {checked2 && <Text style={styles.checkmark}>✔</Text>}
            </Pressable>
            <Text style={styles.label}>
              Tôi đồng ý với
              <Text style={styles.link} onPress={() => alert('Điều khoản')}>
                {' '}điều khoản sử dụng mạng xã hội của Zola
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={showOTPModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Nhận mã xác thực qua số {'\n'}
              <Text style={styles.boldText}>{phoneNumber}?</Text>
            </Text>
            <Text style={{ textAlign: 'center', marginBottom: 15, fontSize: 16 }}>
              Zola sẽ gửi mã xác thực qua số điện thoại này.
            </Text>
            <View style={{ flexDirection: 'column-reverse', gap: 10 }}>
              <TouchableOpacity
                style={{ paddingVertical: 12, alignItems: 'center' }}
                onPress={() => setShowOTPModal(false)}
              >
                <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>
                  Đổi số khác
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ paddingVertical: 12, alignItems: 'center' }}
                onPress={() => {
                  setShowOTPModal(false);
                  navigation.navigate('OTP', { phoneNumber });
                }}
              >
                <Text style={{ color: '#0068FF', fontWeight: 'bold', fontSize: 16 }}>
                  Tiếp tục
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',

  },
  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  placeholder: {
    width: 40,
  },
  logoText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#0068FF',
  },
  form: {
    width: '100%',
  },
  input: {
    borderWidth: 2,
    borderColor: 'blue',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  registerButton: {
    backgroundColor: '#b8d4ff',
    borderRadius: 40,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonActive: {
    backgroundColor: '#0068FF',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  termsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    margin: 10,
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkmark: {
    color: 'blue',
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    color: '#000',
    fontSize: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '85%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 5,
  },
 
  boldText: {
    fontWeight: 'bold',
  },
  
});

export default RegisterScreen; 