import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

type RegisterScreenProps = {
  navigation: any;
};

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tạo tài khoản</Text>
          <View style={styles.placeholder} />
        </View>
        
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Zola</Text>
        </View>
        
        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Số điện thoại"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Tên hiển thị"
            value={name}
            onChangeText={setName}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={[styles.registerButton, phoneNumber && name && password ? styles.registerButtonActive : null]}
            disabled={!phoneNumber || !name || !password}
          >
            <Text style={styles.registerButtonText}>Đăng ký</Text>
          </TouchableOpacity>
          
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              Bằng việc đăng ký, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của Zola
            </Text>
          </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
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
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 15,
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
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});

export default RegisterScreen; 