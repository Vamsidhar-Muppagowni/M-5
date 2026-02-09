const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize DB and Redis
const redisClient = require('./config/redis');

// Middleware imports
const authMiddleware = require('./middleware/auth');
// const errorHandler = require('./middleware/errorHandler');

// Setup Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || '*',
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    socket.on('joinRoom', (room) => socket.join(room));
    socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Global middleware
app.use(helmet());
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/farmer', authMiddleware.authMiddleware, require('./routes/farmer'));
app.use('/api/buyer', authMiddleware.authMiddleware, require('./routes/buyer'));
app.use('/api/market', require('./routes/market'));
app.use('/api/ml', authMiddleware.authMiddleware, require('./routes/ml'));
app.use('/api/government', authMiddleware.authMiddleware, require('./routes/government'));
app.use('/api/logistics', authMiddleware.authMiddleware, require('./routes/logistics'));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // 1. Connect Redis
        await redisClient.connect();

        // 2. Connect Database (MongoDB)
        await connectDB();

        httpServer.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error('❌ Server startup failed:', error);
        process.exit(1);
    }
};

startServer();

module.exports = { app, io };
