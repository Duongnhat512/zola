import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendOTPCode } from '../services/UserService';

type OTPScreenProps = {
  route: any;
  navigation: any;
};

const OTPScreen = ({ route, navigation }: OTPScreenProps) => {
  const { phoneNumber } = route.params;
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpServer, setOtpServer] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const inputsRef = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const fetchOTP = async () => {
      try {
        const res = await sendOTPCode(phoneNumber);
        console.log('Mã OTP đã gửi:', res.otp);
        setOtpServer(res.otp);
      } catch (error) {
        console.error('Lỗi gửi OTP:', error);
      }
    };

    fetchOTP();
  }, [phoneNumber]);

  const handleVerify = () => {
    const otp = otpCode.join('');
    if (otp !== otpServer) {
      setShowErrorModal(true);
      return;
    }
    navigation.navigate('Name', { phoneNumber });
  };

  const handleChange = (text: string, index: number) => {
    const newOtpCode = [...otpCode];
    newOtpCode[index] = text;
    setOtpCode(newOtpCode);

    if (text && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.placeholder} />
        </View>

        <Text style={styles.headerTitle}>Nhập mã xác thực</Text>
        <Text style={styles.phoneNumberTitle}>
          Nhập dãy 6 số được gửi đến số điện thoại{'\n'}
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
                ref={(el) => (inputsRef.current[index] = el)}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.verifyButton,
              otpCode.every((code) => code.length === 1) ? styles.verifyButtonActive : null
            ]}
            disabled={!otpCode.every((code) => code.length === 1)}
            onPress={handleVerify}
          >
            <Text style={styles.verifyButtonText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Modal thông báo OTP sai */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Mã OTP không chính xác</Text>
            <Text style={{ textAlign: 'center', marginBottom: 15, fontSize: 16 }}>
              Vui lòng kiểm tra lại mã và thử lại.
            </Text>
            <TouchableOpacity
              style={{ paddingVertical: 12, alignItems: 'center' }}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={{ color: '#0068FF', fontWeight: 'bold', fontSize: 16 }}>
                Thử lại
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
  headerTitle: { fontSize: 25, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  phoneNumberTitle: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  boldText: { fontWeight: 'bold' },
  form: { width: '100%' },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  input: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: 'blue',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 20,
    paddingVertical: 10
  },
  verifyButton: {
    backgroundColor: '#b8d4ff',
    borderRadius: 40,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20
  },
  verifyButtonActive: {
    backgroundColor: '#0068FF'
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '85%',
    elevation: 5
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  }
});

export default OTPScreen;
