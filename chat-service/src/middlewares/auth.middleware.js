const axios = require("axios");

const BASE_URL = process.env.BASE_URL;

exports.isAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token?.split(" ")[1];
    const res = await axios.post(
      `${BASE_URL}/auth-service/auth/decode-token`,
      { token }
    );
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