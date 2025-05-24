import axios from "../utils/customize-axios";

export const LoginUser = async (data) => {
  try {
    const response = await axios.post("/auth-service/auth/login", data);
    return response;
  } catch (error) {
    alert("Đăng nhập thất bại. Vui lòng thử lại sau.");
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

export const updateUser = async (username, fullname, dob, gender) => {
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
};
export const sendOtp = async (username) => {
  return await axios.post("/auth-service/auth/send-otp", { username });
};
export const registerUser = async (data) => {
  return await axios.post("/auth-service/auth/register", data);
};

export const logoutUser = async (username) => {
  return await axios.post("/auth-service/auth/logout", { username });
};
export const getUserSdt = async (sdt) => {
  return await axios.get(`/chat-service/friends/find?phoneNumber=${sdt}`);
};

export const getUserById = async (id) => {
  try {
    const response = await axios.get(`/auth-service/me/get-user?id=${id}`);
    return response;
  } catch (error) {
    console.error("Failed to get user by ID", error);
    throw error;
  }
};

export const hiddenMessage = async (idMessage,idUser) => {
  try {
    const response = await axios.post(`/chat-service/messages/set-hidden-message`, {
      message_id:idMessage,
      user_id:idUser
    });
    return response;
  } catch (error) {
    console.error("Failed to hidden message", error);
    throw error;
  }
}

export const updateAvt = async (username, base64File) => {
  try {
    const response = await axios.post(
      `/auth-service/me/update-avt`,
      {
        username,
        file: base64File,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Failed to upload avatar", error);
    throw error;
  }
};

export const getUsersByListUserId = async (listUserId)=>{
   try {
    const response = await axios.get(`/auth-service/me/get-users-by-list-user-id?listUserId=${listUserId}`);
    return response;
  } catch (error) {
    console.error("Failed to get user by ID", error);
    throw error;
  }
}