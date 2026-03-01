const mlService = require('../services/mlService');

/**
 * ML Controller
 * 
 * Acts as a bridge between the API routes and the ML Service.
 * Handles requests for price prediction, market insights, and recommendations.
 */

exports.predictPrice = async (req, res) => {
    try {
        const result = await mlService.predictPrice(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

exports.getMarketInsights = async (req, res) => {
    try {
        const result = await mlService.getMarketInsights(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

exports.recommendCrop = async (req, res) => {
    try {
        const result = await mlService.getCropRecommendation(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

exports.recommendPrice = async (req, res) => {
    try {
        const price = await mlService.getRecommendedPrice(req.body);
        res.json({
            recommended_price: price
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}