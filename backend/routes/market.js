const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');
const { body, param, query } = require('express-validator');

// List crop for sale
router.post('/crops/list', [
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
    param('id').isUUID().withMessage('Invalid crop ID')
], marketController.getCropDetails);

// Place bid
router.post('/bids', [
    body('crop_id').isUUID().withMessage('Invalid crop ID'),
    body('amount').isFloat({ gt: 0 }).withMessage('Bid amount must be greater than 0')
], marketController.placeBid);

// Respond to bid
router.post('/bids/respond', [
    body('bid_id').isUUID().withMessage('Invalid bid ID'),
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
router.get('/my-crops', marketController.getCrops);

// Get farmer's bids
router.get('/my-bids', async (req, res) => {
    try {
        const bids = await require('../models').Bid.findAll({
            where: { buyer_id: req.user.id },
            include: [{
                model: require('../models').Crop,
                include: [{
                    model: require('../models').User,
                    as: 'farmer',
                    attributes: ['name', 'phone']
                }]
            }],
            order: [['created_at', 'DESC']]
        });

        res.json({ bids });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
