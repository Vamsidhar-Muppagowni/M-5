const jwt = require('jsonwebtoken');
const {
    User,
    FarmerProfile,
    BuyerProfile
} = require('../models');
const redisClient = require('../config/redis');
const smsService = require('../services/smsService');
const {
    validationResult
} = require('express-validator');

const generateToken = (user) => {
    return jwt.sign({
        id: user._id,
        phone: user.phone,
        user_type: user.user_type
    },
        process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '7d'
    }
    );
};

exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const {
            phone,
            name,
            password,
            user_type,
            language,
            email
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({
                error: 'User already exists with this phone number'
            });
        }

        // Create user
        const userData = {
            phone,
            name,
            password,
            user_type,
            language: language || 'en'
        };

        if (email && email.trim() !== '') {
            userData.email = email;
        }

        const user = await User.create(userData);

        // Create profile based on user type
        if (user_type === 'farmer') {
            await FarmerProfile.create({
                user: user._id
            });
        } else if (user_type === 'buyer') {
            await BuyerProfile.create({
                user: user._id
            });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await redisClient.setEx(`otp:${phone}`, 300, otp);

        // Send OTP
        await smsService.sendSMS(phone, `Your verification OTP is: ${otp}`);

        // DEV ONLY
        if (process.env.NODE_ENV === 'development') {
            const fs = require('fs');
            fs.writeFileSync('otp.txt', `Latest OTP for ${phone}: ${otp}\n`);
            console.log(`[DEV] OTP for ${phone}: ${otp}`);
        }

        const token = generateToken(user);

        res.status(201).json({
            message: 'User registered successfully. OTP sent for verification.',
            user: {
                id: user._id,
                phone: user.phone,
                name: user.name,
                user_type: user.user_type,
                language: user.language
            },
            token,
            requires_verification: true,
            dev_otp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        const storedOTP = await redisClient.get(`otp:${phone}`);

        if (!storedOTP) {
            return res.status(400).json({
                error: 'OTP expired or not found'
            });
        }

        if (storedOTP !== otp) {
            return res.status(400).json({
                error: 'Invalid OTP'
            });
        }

        // Update verify status
        await User.updateOne({ phone }, { is_verified: true });

        await redisClient.del(`otp:${phone}`);

        res.json({
            message: 'Phone number verified successfully'
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { phone, password } = req.body;

        const user = await User.findOne({ phone }).select('+password');
        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        const isPasswordValid = await user.matchPassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Update last login
        user.last_login = new Date();
        await user.save({ validateBeforeSave: false });

        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                phone: user.phone,
                name: user.name,
                user_type: user.user_type,
                language: user.language,
                is_verified: user.is_verified,
                email: user.email,
                location: user.location
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

exports.resendOTP = async (req, res) => {
    try {
        const { phone } = req.body;

        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        if (user.is_verified) {
            return res.status(400).json({
                error: 'User already verified'
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await redisClient.setEx(`otp:${phone}`, 300, otp);

        await smsService.sendSMS(phone, `Your verification OTP is: ${otp}`);

        if (process.env.NODE_ENV === 'development') {
            const fs = require('fs');
            fs.writeFileSync('otp.txt', `Latest OTP for ${phone}: ${otp}\n`);
            console.log(`[DEV] OTP for ${phone}: ${otp}`);
        }

        res.json({
            message: 'OTP resent successfully',
            dev_otp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;

        console.log('[Auth] Update profile request for user:', userId);
        console.log('[Auth] Update payload:', JSON.stringify(updates, null, 2));

        delete updates.password;
        delete updates.phone;
        delete updates.user_type;

        console.log('[Auth] Sanitized updates:', JSON.stringify(updates, null, 2));

        const user = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true
        });

        console.log('[Auth] Updated user:', JSON.stringify(user, null, 2));

        res.json({
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        console.error('[Auth] Update profile error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

exports.changeLanguage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { language } = req.body;

        if (!language) {
            return res.status(400).json({
                error: 'Language is required'
            });
        }

        await User.findByIdAndUpdate(userId, { language });

        res.json({
            message: 'Language updated successfully',
            language
        });
    } catch (error) {
        console.error('Change language error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        let query = User.findById(userId);

        if (req.user.user_type === 'farmer') {
            // In Mongoose, we populate the virtual or actual reference. 
            // In User model I defined 'farmerProfile' as a direct ref field.
            query = query.populate('farmerProfile');
        } else if (req.user.user_type === 'buyer') {
            query = query.populate('buyerProfile');
        }

        const user = await query;

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};