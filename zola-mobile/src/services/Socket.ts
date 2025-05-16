import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getAccessToken = async () => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
      console.log("Access Token:", token);
      return token;
    } else {
      console.error("Access Token is missing");
      return null;
    }
  } catch (err) {
    console.error("Error retrieving access token:", err);
    return null;
  }
};

const setupSocket = async () => {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error("Access Token is missing");
    }

    const socket = io("http://172.28.60.136:5002", { // Fixed the cursor position
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: `${token}`, // Gửi token qua header Authorization
          },
        },
      },
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    return socket;
  } catch (err) {
    console.error("Error setting up socket:", err);
    throw err;
  }
};

export default setupSocket;