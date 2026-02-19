const express = require('express');
const router = express.Router();
const buyerController = require('../controllers/buyerController');

router.get('/stats', buyerController.getStats);

module.exports = router;
