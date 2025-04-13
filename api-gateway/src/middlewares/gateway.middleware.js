const axios = require("axios");
const {
  createProxyMiddleware: proxyMiddleware,
} = require("http-proxy-middleware");

// HTTP proxy
module.exports.createProxyMiddleware = (serviceUrl) => async (req, res) => {
  const url = `${serviceUrl}${req.url}`;
  try {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(req.headers.authorization && {
        Authorization: req.headers.authorization,
      }),
    };

    const response = await axios({
      method: req.method,
      url,
      data: req.body,
      headers,
    });
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error(`Proxy Error:`, error.message);
    res
      .status(error.response?.status || 500)
      .send(error.response?.data || "Internal Server Error");
  }
};

// WebSocket proxy middleware
module.exports.createWebSocketProxyMiddleware = (path, serviceUrl) => {
  return proxyMiddleware({
    target: serviceUrl,
    changeOrigin: true,
    ws: true,
    pathRewrite: { [`^${path}`]: "" },
    logLevel: "debug",
    onError: (err, req, res) => {
      console.error("Proxy error:", err);
      if (res && res.writeHead) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Proxy error: " + err.message);
      }
    },
  });
};
