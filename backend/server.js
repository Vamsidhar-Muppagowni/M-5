const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit'); // Changed from rate-limiter-flexible for simplicity in setup
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize DB and Redis with fallback logic
let sequelize = require('./config/database');
const redisClient = require('./config/redis');

// Middleware imports
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

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
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', limiter);

app.use('/uploads', express.static('uploads'));

// Routes
// We require routes AFTER db initialization might change? No, models require sequelize instance.
// If we switch to SQLite, models need to use that instance.
// models/index.js imports config/database.js, so it shares the instance.

app.use('/api/auth', require('./routes/auth'));
app.use('/api/farmer', authMiddleware.authMiddleware, require('./routes/farmer'));
app.use('/api/buyer', authMiddleware.authMiddleware, require('./routes/buyer'));
app.use('/api/market', authMiddleware.authMiddleware, require('./routes/market'));
app.use('/api/ml', authMiddleware.authMiddleware, require('./routes/ml'));
app.use('/api/government', authMiddleware.authMiddleware, require('./routes/government'));
app.use('/api/logistics', authMiddleware.authMiddleware, require('./routes/logistics'));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // 1. Try Redis
        await redisClient.connect();
        // (Redis config now handles fallback to mock internally if connect fails)

        // 2. Database Connection
        try {
            await sequelize.authenticate();
            console.log(`✅ Database connected (${sequelize.options.dialect})`);
        } catch (dbError) {
            console.error('❌ Database Connection Failed:', dbError.message);
            if (sequelize.options.dialect !== 'sqlite') {
                console.error('   If you do not have PostgreSQL installed, set USE_SQLITE=true in your .env file or environment variables.');
            }
            process.exit(1);
        }

        // Sync models
        if (process.env.NODE_ENV !== 'production') {
            // Workaround for SQLite alter table limitations
            if (sequelize.options.dialect === 'sqlite') {
                await sequelize.query('PRAGMA foreign_keys = OFF;');
            }

            try {
                await sequelize.sync({ alter: true });
                console.log('✅ Database synced');
            } catch (syncError) {
                console.error('❌ Database Sync Failed:', syncError.message);
                if (sequelize.options.dialect === 'sqlite') {
                    console.warn('   Note: SQLite has limitations with ALTER TABLE. You might need to delete database.sqlite to reset schema if development changes are incompatible.');
                }
            }

            if (sequelize.options.dialect === 'sqlite') {
                await sequelize.query('PRAGMA foreign_keys = ON;');
            }
        }

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
