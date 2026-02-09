const { Crop, Bid, Transaction } = require('../models');

exports.getStats = async (req, res) => {
    try {
        const farmerId = req.user.id;

        const activeListings = await Crop.countDocuments({
            farmer: farmerId,
            status: 'listed'
        });

        const totalSales = await Transaction.countDocuments({
            farmer: farmerId
        });

        // Earnings
        const transactions = await Transaction.find({
            farmer: farmerId
        }).select('amount'); // Transaction model uses 'amount' not 'final_price' in my migration

        const earnings = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

        // Pending Bids - Count bids where farmer is recipient and status is pending
        const pendingBids = await Bid.countDocuments({
            farmer: farmerId,
            status: 'pending'
        });

        res.json({
            activeListings,
            totalSales,
            pendingBids,
            earnings
        });
    } catch (error) {
        console.error('Get farmer stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
