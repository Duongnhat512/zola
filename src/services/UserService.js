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

export const updateUser = async (username, fullname, dob, gender) => {
  console.log(username, fullname, dob, gender);

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

export const logoutUser = async (username) => {
  try {
    const response = await axios.post("/auth-service/auth/logout", {
      username,
    });
    return response;
  } catch (error) {
    console.error("Logout failed", error);
    throw error;
  }
};
