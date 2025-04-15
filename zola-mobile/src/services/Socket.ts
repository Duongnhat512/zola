import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const setupSocket = async () => {
  const token = await AsyncStorage.getItem("accessToken"); // Lấy token từ AsyncStorage
  if (!token) {
    console.error("Không tìm thấy token. Vui lòng đăng nhập lại.");
    throw new Error("Token không hợp lệ");
  }

  const socket = io("http://172.20.10.9:5002", {
    transportOptions: {
      polling: {
        extraHeaders: {
          Authorization: `${token}`, // Gửi token qua header Authorization
        },
      },
    },
  });


  return socket;
};

export default setupSocket;

