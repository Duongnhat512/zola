import axios from "../utils/customize-axios";

export const LoginUser = async (data) => {
  try {
    const response = await axios.post("/auth-service/auth/login", {
      username: data.phoneNumber,
      password: data.password
    });
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export const Update = async (data)=>
{ 
  console.log("🔄 Updating user with data:", data);

  const response = await axios.post("/auth-service/me/update", {
    username: data.username,
    fullname: data.fullname,
    dob: data.dob,
    gender: data.gender,    // ảnh đại diện (URL)
    status: data.status  // trạng thái (bio/status)
  });
}
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
  console.log(username,fullname,dob,gender);
  
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
export const registerUser = async (data) => {
  try {
    console.log("Registering user with data:", data);
    const response = await axios.post("/auth-service/auth/register", {
      username: data.userName,
      password: data.password,
      fullname: data.fullname,
      dob: data.dob,
      gender: data.gender,
      status: data.status
    });
    return response;
  } catch (error) {
    console.error("Registration failed", error);
    throw error;
  }
};

