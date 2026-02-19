const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');
const { body, param, query } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');

// List crop for sale
router.post('/crops/list', [
    authMiddleware,
    body('name').notEmpty().withMessage('Crop name is required'),
    body('quantity').isFloat({ gt: 0 }).withMessage('Quantity must be greater than 0'),
    body('min_price').isFloat({ gt: 0 }).withMessage('Minimum price must be greater than 0'),
    body('quality_grade').isIn(['A', 'B', 'C', 'D']).withMessage('Invalid quality grade')
], marketController.listCrop);

// Get all crops
router.get('/crops', [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['draft', 'listed', 'reserved', 'sold', 'expired'])
], marketController.getCrops);

// Get crop details
router.get('/crops/:id', [
    param('id').isMongoId().withMessage('Invalid crop ID')
], marketController.getCropDetails);

// Place bid
router.post('/bids', [
    authMiddleware,
    body('crop_id').isMongoId().withMessage('Invalid crop ID'),
    body('amount').isFloat({ gt: 0 }).withMessage('Bid amount must be greater than 0')
], marketController.placeBid);

// Respond to bid
router.post('/bids/respond', [
    authMiddleware,
    body('bid_id').isMongoId().withMessage('Invalid bid ID'),
    body('action').isIn(['accept', 'reject', 'counter']).withMessage('Invalid action')
], marketController.respondToBid);

// Get price history for chart
router.get('/prices/history', [
    query('crop').optional().isString(),
    query('days').optional().isInt({ min: 1, max: 365 })
], marketController.getPriceHistory);

// Get recent market updates (prices)
router.get('/prices/recent', marketController.getRecentPrices);

// Get farmer's crops
router.get('/my-crops', authMiddleware, marketController.getCrops);

// Get buyer's bids
router.get('/my-bids', authMiddleware, marketController.getBuyerBids);

// Get bids received by farmer (for their crops)
router.get('/bids/received', authMiddleware, marketController.getFarmerReceivedBids);

module.exports = router;
