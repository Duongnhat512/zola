import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

type PrivateInformationScreenProps = {
 route: any;
  navigation: any;
};

const PrivateInformationScreen = ({ route, navigation }: PrivateInformationScreenProps) => {
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [open, setOpen] = useState(false);
  const [gender, setGender] = useState(null);


  const { phoneNumber, userName } = route.params; 
  const [items, setItems] = useState([
    { label: 'Nam', value: 'Nam' },
    { label: 'Nữ', value: 'Nữ' },
    { label: 'Khác', value: 'Khác' },
  ]);

  const handleConfirm = (selectedDate: Date) => {
    setDate(selectedDate);
    setDatePickerVisibility(false);
  };

  const handleContinue = () => {
  // Validate ngày sinh: phải >13 tuổi
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  if (age < 13) {
    alert('Bạn phải trên 13 tuổi để đăng ký.');
    return;
  }
  // Validate giới tính
  if (!gender || !['Nam', 'Nữ', 'Khác'].includes(gender)) {
    alert('Vui lòng chọn giới tính hợp lệ.');
    return;
  }

  const pad = (n: number) => n < 10 ? '0' + n : n;
const birthday = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  navigation.navigate('Password', { userName, phoneNumber, gender, birthday });
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

        <Text style={styles.headerTitle}>Thêm thông tin cá nhân</Text>

        {/* Form */}
        <View style={styles.form}>
          {/* Ngày sinh */}
          <Text style={styles.label}>Sinh nhật</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => setDatePickerVisibility(true)}>
            <Text style={{ fontSize: 16 }}>{date.toLocaleDateString('vi-VN')}</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={() => setDatePickerVisibility(false)}
          />

          {/* Giới tính */}
          <Text style={styles.label}>Giới tính</Text>
          <DropDownPicker
            open={open}
            value={gender}
            items={items}
            setOpen={setOpen}
            setValue={setGender}
            setItems={setItems}
            placeholder="Chọn giới tính"
            style={{ borderColor: 'blue' }}
            dropDownContainerStyle={{ borderColor: 'blue' }}
          />

          {/* Nút tiếp tục */}
          <TouchableOpacity
            style={[styles.registerButton, gender ? styles.registerButtonActive : null]}
            disabled={!gender}
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
  dateInput: {
    borderWidth: 2,
    borderColor: 'blue',
    borderRadius: 10,
    padding: 15,
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

export default PrivateInformationScreen;
