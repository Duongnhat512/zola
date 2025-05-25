import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { Provider } from 'react-redux';
import store from './redux/store';
import FlashMessage from 'react-native-flash-message'; // Thêm dòng này

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppNavigator />
        <FlashMessage position="top" /> {/* Thêm dòng này để hiển thị flash message */}
      </Provider>
    </SafeAreaProvider>
  );
}