const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authMiddleware } = require('../middleware/auth');
const { body, param, query } = require('express-validator');

// All routes require authentication
router.use(authMiddleware);

// Create a new transaction (usually from an accepted bid)
router.post('/', [
    body('bid_id').isMongoId().withMessage('Invalid Bid ID'),
    body('payment_method').optional().isIn(['cash', 'upi', 'bank_transfer', 'card'])
], transactionController.createTransaction);

// Get transactions (History)
router.get('/', [
    query('role').optional().isIn(['buyer', 'farmer']),
    query('status').optional().isIn(['pending', 'completed', 'failed'])
], transactionController.getTransactions);

// Get single transaction details
router.get('/:id', [
    param('id').isMongoId().withMessage('Invalid Transaction ID')
], transactionController.getTransaction);

// Process Payment (Simulate)
router.post('/:id/pay', [
    param('id').isMongoId().withMessage('Invalid Transaction ID'),
    body('payment_method').isIn(['cash', 'upi', 'bank_transfer', 'card']).withMessage('Invalid payment method')
], transactionController.processPayment);

// Update Delivery Status
router.patch('/:id/delivery', [
    param('id').isMongoId().withMessage('Invalid Transaction ID'),
    body('status').isIn(['pending', 'scheduled', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status')
], transactionController.updateDeliveryStatus);

module.exports = router;
