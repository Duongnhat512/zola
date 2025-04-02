const axios = require('axios');

exports.createProxyMiddleware = (serviceUrl) => async (req, res) => {
    const url = `${serviceUrl}${req.url}`;
    try {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(req.headers.authorization && { Authorization: req.headers.authorization })
        };

        const response = await axios({
            method: req.method,
            url,
            data: req.body,
            headers
        });
        res.status(response.status).send(response.data);
    } catch (error) {
        console.error(`Proxy Error:`, error.message);
        res.status(error.response?.status || 500).send(error.response?.data || 'Internal Server Error');
    }
};