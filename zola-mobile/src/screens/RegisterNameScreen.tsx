import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

type RegisterNameScreenProps = {
  route: any;
  navigation: any;
};

const RegisterNameScreen = ({ route,navigation }: RegisterNameScreenProps) => {
  const [userName, setUserName] = useState('');
  const {phoneNumber} = route.params;
  console.log('phoneNumber', phoneNumber);

  const isValidName = (name: string) => {
    const lengthValid = name.length >= 2 && name.length <= 40;
    const noNumbers = /^[^\d]+$/.test(name);
    return lengthValid && noNumbers;
  };

  const handleContinue = () => {
    if (isValidName(userName)) {
      navigation.navigate('PrivateInformation', { userName, phoneNumber });
    } else {
      alert('Tên không hợp lệ. Vui lòng kiểm tra lại.');
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

        <Text style={styles.headerTitle}>Nhập tên Zola</Text>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Tên Zola"
            value={userName}
            onChangeText={setUserName}
          />

          {/* Chú ý */}
          <View style={styles.noticeContainer}>
            <Text style={styles.notice}>• Dài từ 2 đến 40 ký tự</Text>
            <Text style={styles.notice}>• Không chứa số</Text>
            <Text style={styles.notice}>
                • Cần tuân thủ <Text style={styles.link}>quy định đặt tên Zalo</Text>
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.registerButton, userName.trim() !== '' ? styles.registerButtonActive : null]}
            disabled={userName.trim() === ''}
            onPress={handleContinue}
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
  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  placeholder: {
    width: 40,
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
    marginBottom: 15,
  },
  noticeContainer: {
    marginBottom: 20,
  },
  notice: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  registerButton: {
    backgroundColor: '#b8d4ff',
    borderRadius: 40,
    paddingVertical: 16,
    alignItems: 'center',
  },
  registerButtonActive: {
    backgroundColor: '#0068FF',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

export default RegisterNameScreen;
