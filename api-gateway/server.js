require('dotenv').config();
const express = require('express');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(express.json());

const services = {
    authService: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
    chatService: process.env.CHAT_SERVICE_URL || 'http://localhost:5002',
};

// Create proxy middleware
const { createProxyMiddleware } = require('./src/middlewares/gateway.middleware');

// Routes
app.use('/api/v1/auth-service', createProxyMiddleware(services.authService));
app.use('/api/v1/chat', createProxyMiddleware(services.chatService));

// Health Check
app.get('/', (req, res) => res.send('API Gateway is running...'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Gateway is running on port ${PORT}`));