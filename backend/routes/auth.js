const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body, param } = require('express-validator');

// Register new user
router.post('/register', [
    body('phone').matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number'),
    body('name').notEmpty().withMessage('Name is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('user_type').isIn(['farmer', 'buyer']).withMessage('Invalid user type')
], authController.register);

// Verify OTP
router.post('/verify-otp', [
    body('phone').matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number'),
    body('otp').matches(/^\d{6}$/).withMessage('OTP must be 6 digits')
], authController.verifyOTP);

// Login
router.post('/login', [
    body('phone').matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number'),
    body('password').notEmpty().withMessage('Password is required')
], authController.login);

// Resend OTP
router.post('/resend-otp', [
    body('phone').matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number')
], authController.resendOTP);

// Get profile (protected) - using authMiddleware in middleware/auth.js which is applied in server.js to this whole router base? 
// No, in server.js: app.use('/api/auth', authRoutes). Auth middleware is NOT applied to /api/auth globally.
// So we need to apply it here for protected routes.
const { authMiddleware } = require('../middleware/auth');
router.get('/profile', authMiddleware, authController.getProfile);

// Update profile (protected)
router.put('/profile', authMiddleware, authController.updateProfile);

// Change language (protected)
router.put('/language', [
    authMiddleware,
    body('language').isIn(['en', 'hi', 'ta', 'te', 'ml', 'kn', 'bn', 'mr', 'gu', 'pa']).withMessage('Unsupported language')
], authController.changeLanguage);

module.exports = router;
