import axios from "../utils/customize-axios";

export const LoginUser = async (data) => {
  try {
    const response = await axios.post("/auth-service/auth/login", data);
    return response;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};
