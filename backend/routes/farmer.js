const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');

const {
    authMiddleware
} = require('../middleware/auth');

router.get('/stats', authMiddleware, farmerController.getStats);

module.exports = router;