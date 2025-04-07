import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import {registerUser} from '../services/UserService'; // Import hàm gọi API từ UserService
type PasswordScreenProps = {
  route: any;  // Thêm route để lấy params
  navigation: any;
};

const PasswordScreen = ({ route, navigation }: PasswordScreenProps) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordValid, setPasswordValid] = useState(true);
  const { userName, phoneNumber, gender, birthday } = route.params; // Lấy userName và phoneNumber từ params

  // Kiểm tra tính hợp lệ của mật khẩu
  const validatePassword = (password: string) => {
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/;
    const year = birthday.split('/')[2]; // Lấy năm sinh từ birthday
    const forbiddenWords = ['Zalo', userName, year];
    console.log('userName', year);
    if (forbiddenWords.some(word => password.includes(word))) {
      return "Mật khẩu không chứa tên 'Zalo', 'Tên của bạn', hoặc 'Năm sinh của bạn'.";
    }
    if (!regex.test(password)) {
      return "Mật khẩu phải có ít nhất 6 ký tự, bao gồm số và ký tự đặc biệt.";
    }
    return null;
  };

  // Kiểm tra điều kiện để nút tiếp tục hoạt động
  const isFormValid = () => {
    const error = validatePassword(password);
    return password && confirmPassword && password === confirmPassword && !error;
  };

  // Xử lý sự kiện tiếp tục
  const handleContinue = async () => {
    const error = validatePassword(password);
    if (error) {
      setPasswordValid(false);
      Alert.alert('Thông báo', error);
    } else if (password !== confirmPassword) {
      console.log(phoneNumber, userName, birthday, gender);
      Alert.alert('Thông báo', 'Mật khẩu và xác nhận mật khẩu không trùng khớp!');
    } else {
      // Tiến hành gọi API tạo tài khoản
      try {
        const data = {
          userName: phoneNumber,
          password: password,
          fullname: userName, // Pass the fullname to API
          dob: birthday,
          gender:gender,
          status: 'active', // Or whatever status you want to set
        };

        const response = await registerUser(data); // Gọi hàm registerUser từ UserService

        if (response) { // Assuming 200 is the success status code
          Alert.alert('Thông báo', 'Tạo tài khoản thành công!');
          navigation.navigate('Welcome'); // Navigate to the next screen
        } else {
          Alert.alert('Thông báo', 'Có lỗi trong quá trình tạo tài khoản.');
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Thông báo', 'Đã xảy ra lỗi khi kết nối với máy chủ.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.placeholder} />
        </View>

        <Text style={styles.headerTitle}>Tạo mật khẩu</Text>

        {/* Form */}
        <View style={styles.form}>
          {/* Nhập mật khẩu */}
          <Text style={styles.label}>Nhập mật khẩu</Text>
          <TextInput
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={[styles.input, !passwordValid && { borderColor: 'red' }]}
            placeholder="Nhập mật khẩu"
          />

          {/* Xác nhận lại mật khẩu */}
          <Text style={styles.label}>Xác nhận lại mật khẩu</Text>
          <TextInput
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={[styles.input, !passwordValid && { borderColor: 'red' }]}
            placeholder="Xác nhận mật khẩu"
          />

          {/* Nút tiếp tục */}
          <TouchableOpacity
            style={[styles.registerButton, password && confirmPassword ? styles.registerButtonActive : null]}
            onPress={handleContinue}
            disabled={password === '' || confirmPassword === ''}
          >
            <Text style={styles.registerButtonText}>Tiếp tục</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  placeholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    width: '100%',
    gap: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 2,
    borderColor: 'blue',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
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
});

export default PasswordScreen;
