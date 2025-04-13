import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { registerUser } from '../services/UserService';

const PasswordScreen = ({ route, navigation }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { userName, phoneNumber, gender, birthday } = route.params;

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/;
    const year = birthday.split('/')[2];
    const forbiddenWords = ['Zalo', userName, year];
    if (forbiddenWords.some(word => password.includes(word))) {
      return "Mật khẩu không được chứa 'Zalo', tên của bạn hoặc năm sinh.";
    }
    if (!regex.test(password)) {
      return "Mật khẩu phải chứa ít nhất 6 ký tự, bao gồm ít nhất một số và một ký tự đặc biệt.";
    }
    return null;
  };

  const handleContinue = async () => {
    const error = validatePassword(password);
    if (error) {
      setErrorMessage(error);
      setShowErrorModal(true);
    } else if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu và xác nhận mật khẩu không trùng khớp. Vui lòng kiểm tra lại.');
      setShowErrorModal(true);
    } else {
      try {
        const data = {
          userName: phoneNumber,
          password,
          fullname: userName,
          dob: birthday,
          gender,
          status: 'active',
        };
        const response = await registerUser(data);
        if (response) {
          Alert.alert('Thông báo', 'Tạo tài khoản thành công!');
          navigation.navigate('Welcome');
        } else {
          setErrorMessage('Đã xảy ra lỗi trong quá trình tạo tài khoản. Vui lòng thử lại sau.');
          setShowErrorModal(true);
        }
      } catch (error) {
        console.error(error);
        setErrorMessage('Số điện thoại đã tồn tại. Vui lòng thử lại với số điện thoại khác.');
        setShowErrorModal(true);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.placeholder} />
        </View>

        <Text style={styles.headerTitle}>Tạo mật khẩu</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Nhập mật khẩu</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              secureTextEntry={!passwordVisible}
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              placeholder="Nhập mật khẩu"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              <Ionicons name={passwordVisible ? 'eye' : 'eye-off'} size={24} color="gray" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Xác nhận lại mật khẩu</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              secureTextEntry={!confirmPasswordVisible}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              placeholder="Xác nhận mật khẩu"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            >
              <Ionicons name={confirmPasswordVisible ? 'eye' : 'eye-off'} size={24} color="gray" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.registerButton,
              password && confirmPassword ? styles.registerButtonActive : null,
            ]}
            onPress={handleContinue}
            disabled={password === '' || confirmPassword === ''}
          >
            <Text style={styles.registerButtonText}>Tiếp tục</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Modal thông báo lỗi */}
      <Modal visible={showErrorModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lỗi</Text>
            <Text style={{ textAlign: 'center', marginBottom: 15, fontSize: 16 }}>
              {errorMessage}
            </Text>
            <TouchableOpacity
              style={{ paddingVertical: 12, alignItems: 'center' }}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={{ color: '#0068FF', fontWeight: 'bold', fontSize: 16 }}>
                Đóng
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30
  },
  backButton: { padding: 10 },
  backButtonText: { fontSize: 24, fontWeight: 'bold' },
  placeholder: { width: 40 },
  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30
  },
  form: { width: '100%', gap: 15 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'blue',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeIcon: { marginLeft: 10 },
  registerButton: {
    backgroundColor: '#b8d4ff',
    borderRadius: 40,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonActive: {
    backgroundColor: '#0068FF',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
});

export default PasswordScreen;
