import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import styles from '../styles/WelcomeScreen.styles';

// Add navigation types
type WelcomeScreenProps = {
  navigation: any;
};

const WelcomeScreen = ({ navigation }: WelcomeScreenProps) => {
  return (
    <View style={styles.rootContainer}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        
        {/* Language Selector */}
        {/* Cần code lại với combobox */}
        <View style={styles.languageSelector}>
          <TouchableOpacity style={styles.languageButton}>
            <Text style={styles.languageText}>Tiếng Việt</Text>
            <Text style={styles.arrowDown}>▼</Text>
          </TouchableOpacity>
        </View>
        
        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* City Skyline Background - Using a View for the illustration shown in the image */}
          <View style={styles.illustrationContainer}>
            {/* Zalo Logo */}
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
        </View>
      </SafeAreaView>
    </View>
  );
};

export default WelcomeScreen;
