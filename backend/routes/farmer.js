const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');

const {
    authMiddleware
} = require('../middleware/auth');

router.get('/stats', authMiddleware, farmerController.getStats);

// Payment Credentials Routes
router.get('/payment-credentials', authMiddleware, farmerController.getPaymentCredentials);
router.put('/payment-credentials', authMiddleware, farmerController.updatePaymentCredentials);

module.exports = router;