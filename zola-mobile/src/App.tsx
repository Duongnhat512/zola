import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { Provider } from 'react-redux';
import store from './redux/store';
import { View } from 'react-native';

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    </SafeAreaProvider>
  );
}
