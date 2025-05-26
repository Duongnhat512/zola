import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import styles from '../styles/WelcomeScreen.styles';
import { qrLogin } from '../services/UserService';
import AsyncStorage from '@react-native-async-storage/async-storage';

type WelcomeScreenProps = {
  navigation: any;
};

const WelcomeScreen = ({ navigation }: WelcomeScreenProps) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [showScanner, setShowScanner] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('Lỗi', 'Bạn chưa đăng nhập!');
        return;
      }
      await qrLogin(data, token);
      Alert.alert('Thành công', 'Đăng nhập web thành công!');
      setShowScanner(false);
      setScanned(false);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Có lỗi xảy ra');
      setShowScanner(false);
      setScanned(false);
      navigation.goBack();
    }
  };

  return (
    <View style={styles.rootContainer}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        {/* Language Selector */}
        <View style={styles.languageSelector}>
          <TouchableOpacity style={styles.languageButton}>
            <Text style={styles.languageText}>Tiếng Việt</Text>
            <Text style={styles.arrowDown}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.illustrationContainer}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>Zola</Text>
            </View>
          </View>

          {/* Pagination Dots */}
          <View style={styles.paginationContainer}>
            <View style={styles.paginationDot} />
            <View style={styles.paginationDot} />
            <View style={styles.paginationDot} />
            <View style={styles.paginationDot} />
            <View style={[styles.paginationDot, styles.activeDot]} />
          </View>
        </View>

        {/* Bottom Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerButtonText}>Tạo tài khoản mới</Text>
          </TouchableOpacity>

          {/* QR Scanner Button */}
          <TouchableOpacity
            style={styles.qrButton}
            onPress={async () => {
              if (!permission?.granted) {
                await requestPermission();
              }
              setShowScanner(true);
              setScanned(false);
            }}
          >
            <Image
              source={require('../assets/zalo-icon/qr-code.png')}
              style={styles.qrIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Camera View */}
      {showScanner && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          <TouchableOpacity
            style={{ position: 'absolute', top: 40, right: 20, backgroundColor: '#fff', padding: 10, borderRadius: 20 }}
            onPress={() => setShowScanner(false)}
          >
            <Text style={{ fontSize: 18 }}>Đóng</Text>
          </TouchableOpacity>
        </CameraView>
      )}
    </View>
  );
};

export default WelcomeScreen;