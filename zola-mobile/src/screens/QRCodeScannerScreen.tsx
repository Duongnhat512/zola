import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function QRCodeScannerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    // Giả sử data là sessionId
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('Lỗi', 'Bạn chưa đăng nhập!');
        return;
      }
      // Gửi lên server xác thực QR login
      await axios.post('http://<server-url>/qr-login', {
        sessionId: data,
        token,
      });
      Alert.alert('Thành công', 'Đăng nhập web thành công!');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Có lỗi xảy ra');
      navigation.goBack();
    }
  };

  if (hasPermission === null) {
    return <Text>Đang xin quyền truy cập camera...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Bạn chưa cho phép truy cập camera</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && <Button title={'Quét lại'} onPress={() => setScanned(false)} />}
    </View>
  );
}