// filepath: e:\HK2_nam4\zalo\zalo_fe\src\main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './redux/store';
import App from './App';
import './index.css';
import { ToastContainer } from 'react-toastify';
import { initializeNotificationSystem } from './utils/notificationHelpers';

// Khởi tạo hệ thống thông báo
initializeNotificationSystem();

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <Provider store={store}>
    <App />
    <ToastContainer position='top-center' />

  </Provider>
  // </React.StrictMode>
);