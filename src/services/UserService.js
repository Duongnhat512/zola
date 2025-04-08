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
export const LoginToken = async () => {
  try {
    const response = await axios.get("/auth-service/auth/token");
    return response;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const updateUser = async (username,fullname,dob,gender) => {
  try {
    const response = await axios.post("/auth-service/me/update", {
      username,
      fullname,
      dob,
      gender,
    });
    return response;
  } catch (error) {
    console.error("Update failed", error);
    throw error;
  }
};

export const decodedToken = async () => {
  try {
    const response = await axios.post("/auth-service/auth/decode-token");
    return response;
  } catch (error) {
    console.error("Decoded token failed", error);
    throw error;
  }
}
export const sendOtp = async (username) => {
  return await axios.post("/auth-service/auth/send-otp", { username });
};
export const registerUser = async (data) => {
  return await axios.post("/auth-service/auth/register", data);
};