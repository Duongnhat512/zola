import axios from "axios";


const baseURL = process.env.BASE_URL || "http://192.168.2.5:8888/api/v1/";
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
  function (config) {
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
    if (
      error.config &&
      error.response &&
      error.response.status === 401 &&
      !error.config.headers[NO_RETRY_HEADER]
    ) {
      console.error("Unauthorized! Token có thể đã hết hạn.");
    }
    return Promise.reject(error);
  }
);

export default instance;
