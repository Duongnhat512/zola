import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { refreshToken } from '../services/UserService';

const baseURL = "http://172.28.52.251:8888/api/v1/";
const instance = axios.create({
  baseURL: baseURL,
  withCredentials: true, // Để gửi cookie nếu backend dùng
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ✅ Hàm cập nhật token
export const setAuthToken = (token) => {
  if (token) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete instance.defaults.headers.common["Authorization"];
  }
};

const NO_RETRY_HEADER = "x-no-retry";

// Add a request interceptor
instance.interceptors.request.use(
  async function (config) {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  function (response) {
    return response && response.data ? response.data : response;
  },
  async function (error) {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return instance(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newTokens = await refreshToken();
        await AsyncStorage.setItem('accessToken', newTokens.accessToken);
        setAuthToken(newTokens.accessToken);
        
        processQueue(null, newTokens.accessToken);
        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        setAuthToken(null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
