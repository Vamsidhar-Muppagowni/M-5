const express = require('express');
const router = express.Router();
const logisticsController = require('../controllers/logisticsController');

router.post('/calculate', logisticsController.calculateShipping);
router.get('/track/:id', logisticsController.trackShipment);

module.exports = router;
