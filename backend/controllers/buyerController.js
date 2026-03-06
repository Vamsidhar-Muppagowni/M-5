const { Bid, Transaction, BuyerProfile } = require('../models');

exports.getStats = async (req, res) => {
    try {
        const buyerId = req.user.id;

        const activeBids = await Bid.countDocuments({
            buyer: buyerId,
            status: 'pending'
        });

        const completedPurchases = await Transaction.countDocuments({
            buyer: buyerId
        });

        const profile = await BuyerProfile.findOne({ user: buyerId });

        res.json({
            activeBids,
            completedPurchases,
            rating: profile ? profile.rating : 0,
            rating_count: profile ? profile.rating_count : 0
        });
    } catch (error) {
        console.error('Get buyer stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
