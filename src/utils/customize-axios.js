import axios from "axios";

const baseURL =
  import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:8888/api/v1/";
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
    const token = localStorage.getItem("accessToken"); // hoặc sessionStorage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
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
