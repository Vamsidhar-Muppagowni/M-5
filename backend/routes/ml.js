const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');

/**
 * ML Routes
 * 
 * Defines API endpoints for machine learning features:
 * - /predict-price: Get future price predictions
 * - /insights: Get market trend insights
 * - /recommend-crop: Get crop recommendations based on soil/season
 * - /recommend-price: Get optimal selling price suggestion
 */

router.post('/predict-price', mlController.predictPrice);
router.post('/insights', mlController.getMarketInsights);
router.post('/recommend-crop', mlController.recommendCrop);
router.post('/recommend-price', mlController.recommendPrice);

module.exports = router;