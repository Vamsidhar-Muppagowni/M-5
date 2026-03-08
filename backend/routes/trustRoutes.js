const express = require('express');
const router = express.Router();
const trustController = require('../controllers/trustController');

// Issues
router.post('/issue', trustController.reportIssue);

// Reviews
router.post('/review', trustController.submitReview);
router.get('/review/:userId', trustController.getUserReviews);

// Transactions
router.get('/transactions', trustController.getTransactionHistory);

module.exports = router;
