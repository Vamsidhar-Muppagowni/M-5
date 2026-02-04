const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');

router.get('/stats', farmerController.getStats);

module.exports = router;
