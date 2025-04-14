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

module.exports.setupWebSocketProxy = (server, path, targetUrl) => {
  const wsProxy = proxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    ws: true,
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
      if (req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }
    },
    onError: (err, req, res) => {
      console.error('WebSocket Proxy Error:', err);
      if (res && res.writeHead) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('WebSocket Proxy Error: ' + err.message);
      }
    }
  });

  server.on('upgrade', function(req, socket, head) {
    console.log(`Proxying WebSocket request: ${req.url} -> ${targetUrl}`);
    wsProxy.upgrade(req, socket, head);
  });

  return wsProxy;
};
