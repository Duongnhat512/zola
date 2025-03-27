const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv'); 
const createError = require('http-errors');
require("express-async-errors");
const morgan = require('morgan');
const cors = require('cors');

dotenv.config();

const app = express();

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

// Middleware
app.use(morgan('dev'));
app.use(
    bodyParser.urlencoded({
        extended: false,
    })
)
app.use(bodyParser.json());
app.use(cors());

// 
app.get('/', (req, res) => {
    res.send('API is running...');
});
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// Bỏ qua yêu cầu favicon
app.get('/favicon.ico', (req, res) => res.status(204));

// Xử lý lỗi 404
app.use((req, res, next) => {
    next(createError(404));
});

app.use((err, req, res) => {
    console.error(err.stack);
    res.status(err.status || 500).send({
        message: err.message,
        error: err
    });
});

const server = app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
});

