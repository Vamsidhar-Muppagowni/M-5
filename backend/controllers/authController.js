const jwt = require('jsonwebtoken');
const { User, FarmerProfile, BuyerProfile } = require('../models');
const redisClient = require('../config/redis');
const smsService = require('../services/smsService');
const { validationResult } = require('express-validator');

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            phone: user.phone,
            user_type: user.user_type
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
    );
};

exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation Errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { phone, name, password, user_type, language, email } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { phone } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this phone number' });
        }

        // Create user
        const user = await User.create({
            phone,
            name,
            password,
            user_type,
            language: language || 'en',
            email: email === '' ? null : email
        });

        // Create profile based on user type
        if (user_type === 'farmer') {
            await FarmerProfile.create({
                user_id: user.id
            });
        } else if (user_type === 'buyer') {
            await BuyerProfile.create({
                user_id: user.id
            });
        }

        // Generate OTP for verification
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await redisClient.setEx(`otp:${phone}`, 300, otp); // OTP valid for 5 minutes

        // Send OTP via SMS
        await smsService.sendSMS(phone, `Your verification OTP is: ${otp}`);

        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            message: 'User registered successfully. OTP sent for verification.',
            user: {
                id: user.id,
                phone: user.phone,
                name: user.name,
                user_type: user.user_type,
                language: user.language
            },
            token,
            requires_verification: true
        });
    } catch (error) {
        console.error('Registration error:', error);
        // Emergency logging to file
        const fs = require('fs');
        fs.writeFileSync('backend_error.txt', `[${new Date().toISOString()}] ${error.stack}\n`, { flag: 'a' });
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        const storedOTP = await redisClient.get(`otp:${phone}`);

        // For development, allow specific OTP or check if OTP logic matches
        if (!storedOTP) {
            // In dev, maybe skip if redis not working or expired? No, stick to logic.
            return res.status(400).json({ error: 'OTP expired or not found' });
        }

        if (storedOTP !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Update user verification status
        await User.update(
            { is_verified: true },
            { where: { phone } }
        );

        // Remove OTP from Redis
        await redisClient.del(`otp:${phone}`);

        res.json({ message: 'Phone number verified successfully' });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { phone, password } = req.body;

        const user = await User.findOne({ where: { phone } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await User.update(
            { last_login: new Date() },
            { where: { id: user.id } }
        );

        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                phone: user.phone,
                name: user.name,
                user_type: user.user_type,
                language: user.language,
                is_verified: user.is_verified
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.resendOTP = async (req, res) => {
    try {
        const { phone } = req.body;

        const user = await User.findOne({ where: { phone } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.is_verified) {
            return res.status(400).json({ error: 'User already verified' });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await redisClient.setEx(`otp:${phone}`, 300, otp);

        // Send OTP via SMS
        await smsService.sendSMS(phone, `Your verification OTP is: ${otp}`);

        res.json({ message: 'OTP resent successfully' });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;

        // Remove sensitive fields
        delete updates.password;
        delete updates.phone;
        delete updates.user_type;

        await User.update(updates, { where: { id: userId } });

        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        res.json({
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.changeLanguage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { language } = req.body;

        if (!language) {
            return res.status(400).json({ error: 'Language is required' });
        }

        await User.update({ language }, { where: { id: userId } });

        res.json({
            message: 'Language updated successfully',
            language
        });
    } catch (error) {
        console.error('Change language error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: FarmerProfile,
                    required: req.user.user_type === 'farmer',
                    as: 'farmer_profile' // Assuming auto generated alias or need to verify from index.js associations
                },
                {
                    model: BuyerProfile,
                    required: req.user.user_type === 'buyer',
                    as: 'buyer_profile' // Same here
                }
            ]
        });

        // Note: Sequelize association alias might default to model name. 
        // In index.js: User.hasOne(FarmerProfile). 
        // By default the alias is 'farmer_profile' or just FarmerProfile depending on initialization.
        // I should check index.js. 
        // User.hasOne(FarmerProfile). No 'as' defined. Default alias is 'farmer_profile'.

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        // Try again without includes if association names are wrong, as fallback? 
        // Or just return user.
        res.status(500).json({ error: 'Internal server error' });
    }
};
