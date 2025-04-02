import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import styles from '../styles/LoginScreen.styles';

type LoginScreenProps = {
  navigation: any;
};

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleLogin = () => {
    // In a real app, you would validate credentials here
    if (phoneNumber && password) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Blue Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Đăng nhập</Text>
          </View>
        </View>

        {/* Content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              Vui lòng nhập số điện thoại và mật khẩu để đăng nhập
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Phone Number */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                onFocus={() => setFocusedInput('phone')}
                onBlur={() => setFocusedInput(null)}
                placeholder='Số điện thoại'
              />
              <View style={[
                styles.underline, 
                focusedInput === 'phone' && styles.activeUnderline
              ]} />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={passwordHidden}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder='Mật khẩu'
                />
                <TouchableOpacity
                  style={styles.showHideButton}
                  onPress={() => setPasswordHidden(!passwordHidden)}
                >
                  <Text style={styles.showHideButtonText}>
                    {passwordHidden ? 'HIỆN' : 'ẨN'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={[
                styles.underline, 
                focusedInput === 'password' && styles.activeUnderline
              ]} />
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPasswordButton}>
              <Text style={styles.forgotPasswordText}>Lấy lại mật khẩu</Text>
            </TouchableOpacity>
          </View>

          {/* FAQ Button */}
          <View style={styles.faqContainer}>
            <TouchableOpacity style={styles.faqButton}>
              <Text style={styles.faqButtonText}>Câu hỏi thường gặp</Text>
              <Text style={styles.faqButtonIcon}>›</Text>
            </TouchableOpacity>

            {/* Next Button (Floating) */}
            <TouchableOpacity
              style={[
                styles.nextButton,
                phoneNumber && password ? styles.nextButtonActive : {}
              ]}
              disabled={!phoneNumber || !password}
              onPress={handleLogin}
            >
              <Text style={styles.nextButtonText}>→</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen; 