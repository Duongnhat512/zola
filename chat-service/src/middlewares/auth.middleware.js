const axios = require("axios");

const BASE_URL = process.env.BASE_URL;

exports.isAuth = async (socket, next) => {
  const token = socket.handshake.headers.authorization;
  console.log("token", token);
  
  if (!token) {
    return next(new Error("Unauthorized"));
  }

  try {
    const res = await axios.post(
      `${BASE_URL}/auth-service/auth/decode-token`,
      { },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("res", res.data.user);
    socket.user = res.data.user;
    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
};

exports.isAuthExpress = async (req, res, next) => {
  try {
    const tokenFromHeader = req.headers.authorization

    if (!tokenFromHeader) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const res = await axios.post(
      `${BASE_URL}/auth-service/auth/decode-token`,
      {},
      {
        headers: {
          Authorization: tokenFromHeader,
        },
      }
    );
    req.user = res.data.user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};