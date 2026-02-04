const { Bid, Transaction } = require('../models');

exports.getStats = async (req, res) => {
    try {
        const buyerId = req.user.id;

        const activeBids = await Bid.count({
            where: { buyer_id: buyerId, status: 'pending' }
        });

        const completedPurchases = await Transaction.count({
            where: { buyer_id: buyerId }
        });

        res.json({
            activeBids,
            completedPurchases
        });
    } catch (error) {
        console.error('Get buyer stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
