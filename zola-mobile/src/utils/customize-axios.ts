import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseURL = process.env.BASE_URL || "http://localhost:8888/api/v1/";
const instance = axios.create({
  baseURL: baseURL,
  withCredentials: true, // Để gửi cookie nếu backend dùng
});

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
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('accessToken');
      setAuthToken(null);
      
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default instance;
