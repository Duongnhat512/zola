import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { qrLogin } from '../services/UserService';

export default function QRCodeScannerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef<CameraType>(null); // Sửa dòng này

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('Lỗi', 'Bạn chưa đăng nhập!');
        return;
      }
      await qrLogin(data, token);
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
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        barCodeScannerSettings={{
          barCodeTypes: ['qr'], // Không cần BarCodeScanner
        }}
      />
      {scanned && <Button title={'Quét lại'} onPress={() => setScanned(false)} />}
    </View>
  );
}