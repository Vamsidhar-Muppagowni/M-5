const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');

router.post('/predict-price', mlController.predictPrice);
router.post('/insights', mlController.getMarketInsights);
router.post('/recommend-crop', mlController.recommendCrop);
router.post('/recommend-price', mlController.recommendPrice);

module.exports = router;
