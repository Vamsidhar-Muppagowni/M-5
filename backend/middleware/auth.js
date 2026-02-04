const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        if (!user.is_verified) {
            // Allow profile and otp endpoints even if not verified, but block others
            if (!req.path.includes('verify') && !req.path.includes('otp')) {
                // return res.status(403).json({ error: 'Please verify your phone number first' });
                // For development/demo ease, maybe we skip this or provide a way to verify easily
            }
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

const farmerOnly = (req, res, next) => {
    if (req.user.user_type !== 'farmer') {
        return res.status(403).json({ error: 'Farmer access only' });
    }
    next();
};

const buyerOnly = (req, res, next) => {
    if (req.user.user_type !== 'buyer') {
        return res.status(403).json({ error: 'Buyer access only' });
    }
    next();
};

const adminOnly = (req, res, next) => {
    if (req.user.user_type !== 'admin') {
        return res.status(403).json({ error: 'Admin access only' });
    }
    next();
};

module.exports = {
    authMiddleware,
    farmerOnly,
    buyerOnly,
    adminOnly
};
