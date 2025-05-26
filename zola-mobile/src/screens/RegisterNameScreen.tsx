import React, { useState } from 'react';
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

type RegisterNameScreenProps = {
  route: any;
  navigation: any;
};

const RegisterNameScreen = ({ route, navigation }: RegisterNameScreenProps) => {
  const [userName, setUserName] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const { phoneNumber } = route.params;
  console.log('phoneNumber', phoneNumber);

  const isValidName = (name: string) => {
  // Regex: chỉ cho phép chữ cái tiếng Việt, khoảng trắng, dài 2-40 ký tự
  const regex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂĐĨŨƠẶẾỤƯăđĩũơưặếụưýỵỹỳÝỴỸỲ\s]{2,40}$/;
  return regex.test(name.trim());
};

  const handleContinue = () => {
    if (isValidName(userName)) {
      navigation.navigate('PrivateInformation', { userName, phoneNumber });
    } else {
      setShowErrorModal(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              • Cần tuân thủ{' '}
              <Text style={styles.link}>quy định đặt tên Zalo</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.registerButton,
              userName.trim() !== '' ? styles.registerButtonActive : null
            ]}
            disabled={userName.trim() === ''}
            onPress={handleContinue}
          >
            <Text style={styles.registerButtonText}>Tiếp tục</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Modal thông báo lỗi */}
      <Modal visible={showErrorModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tên không hợp lệ</Text>
            <Text style={{ textAlign: 'center', marginBottom: 15, fontSize: 16 }}>
              Vui lòng nhập tên hợp lệ, không chứa số và dài 2-40 ký tự.
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
  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30
  },
  form: { width: '100%' },
  input: {
    borderWidth: 2,
    borderColor: 'blue',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
    fontSize: 16,
    marginBottom: 15
  },
  noticeContainer: { marginBottom: 20 },
  notice: { color: '#666', fontSize: 14, marginBottom: 4 },
  registerButton: {
    backgroundColor: '#b8d4ff',
    borderRadius: 40,
    paddingVertical: 16,
    alignItems: 'center'
  },
  registerButtonActive: {
    backgroundColor: '#0068FF'
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  link: { color: '#007AFF', fontWeight: 'bold' },
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

export default RegisterNameScreen;
