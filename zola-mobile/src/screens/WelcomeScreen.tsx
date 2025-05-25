import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert,Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import styles from '../styles/WelcomeScreen.styles';

// Add navigation types
type WelcomeScreenProps = {
  navigation: any;
};

const WelcomeScreen = ({ navigation }: WelcomeScreenProps) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (showScanner && !permission?.granted) {
      requestPermission();
    }
  }, [showScanner]);

  const handleBarcodeScanned = ({ data, type }: any) => {
    setShowScanner(false);
    Alert.alert('Mã đã quét', `Loại: ${type}\nDữ liệu: ${data}`);
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
            onPress={() => setShowScanner(true)}
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
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />
      )}
    </View>
  );
};

export default WelcomeScreen;
