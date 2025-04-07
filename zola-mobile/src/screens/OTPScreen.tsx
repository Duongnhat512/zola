import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

type OTPScreenProps = {
  route: any;  // Thêm route để lấy params
  navigation: any;
};

const OTPScreen = ({ route, navigation }: OTPScreenProps) => {
  const { phoneNumber } = route.params; // Lấy phoneNumber từ params
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);

  const inputsRef = React.useRef<(TextInput | null)[]>([]);

  const OTP = 123456; // Mã OTP giả định, có thể thay thế bằng mã thực tế từ server
  const handleVerify = () => {
    const otp = otpCode.join('');
    if (otp !== String(OTP)) {
      alert('Mã OTP không chính xác!');
      return;
    }
    navigation.navigate('Name', { phoneNumber });
  };

  const handleChange = (text: string, index: number) => {
    const newOtpCode = [...otpCode];
    newOtpCode[index] = text;
    setOtpCode(newOtpCode);
    if (text && index < 5) {
      const nextInput = index + 1;
      if (nextInput <= 5 && inputsRef.current[nextInput]) {
        inputsRef.current[nextInput]?.focus();
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
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
         
          <View style={styles.placeholder} />
        </View>
        <Text style={styles.headerTitle}>Nhập mã xác thực</Text>

        <Text style={styles.phoneNumberTitle}>Nhập dãy 6 số được gửi đến số điện thoại{'\n'}
            <Text style={styles.boldText}>{phoneNumber}</Text>
        </Text>



        <View style={styles.form}>
          <View style={styles.inputContainer}>
            {otpCode.map((code, index) => (
              <TextInput
                key={index}
                style={styles.input}
                value={code}
                onChangeText={(text) => handleChange(text, index)}
                keyboardType="number-pad"
                maxLength={1}
                ref={(el) => inputsRef.current[index] = el}
              />
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.verifyButton, otpCode.every(code => code.length === 1) ? styles.verifyButtonActive : null]}
            disabled={!otpCode.every(code => code.length === 1)}
            onPress={handleVerify}
          >
            <Text style={styles.verifyButtonText}>Xác nhận</Text>
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
    phoneNumberTitle:{
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },

    placeholder: {
      width: 40,
    },
    form: {
      width: '100%',
    },
    inputContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    input: {
      width: 50,
      height: 50,
      borderWidth: 2,
      borderColor: 'blue',
      borderRadius: 10,
      textAlign: 'center',
      fontSize: 20,
      paddingVertical: 10,
    },
    verifyButton: {
      backgroundColor: '#b8d4ff',
      borderRadius: 40,
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 20,
    },
    verifyButtonActive: {
      backgroundColor: '#0068FF',
    },
    verifyButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    boldText: {
        fontWeight: 'bold',
      },
  });

export default OTPScreen;
