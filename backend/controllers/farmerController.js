const { Crop, Bid, Transaction, FarmerProfile } = require('../models');

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

        const profile = await FarmerProfile.findOne({ user: farmerId });

        res.json({
            activeListings,
            totalSales,
            pendingBids,
            earnings,
            rating: profile ? profile.rating : 0,
            rating_count: profile ? profile.rating_count : 0
        });
    } catch (error) {
        console.error('Get farmer stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getPaymentCredentials = async (req, res) => {
    try {
        const farmerId = req.user.id;
        let profile = await FarmerProfile.findOne({ user: farmerId });

        // If a profile doesn't exist, return empty
        if (!profile) {
            return res.status(200).json({ payment_methods: {} });
        }

        res.json({ payment_methods: profile.payment_methods || {} });
    } catch (error) {
        console.error('Get payment credentials error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updatePaymentCredentials = async (req, res) => {
    try {
        const farmerId = req.user.id;
        const { payment_methods } = req.body;

        let profile = await FarmerProfile.findOne({ user: farmerId });

        if (!profile) {
            // Create one if it doesn't exist just in case
            profile = new FarmerProfile({ user: farmerId });
        }

        profile.payment_methods = payment_methods;
        await profile.save();

        res.json({ message: 'Payment credentials updated successfully', payment_methods: profile.payment_methods });
    } catch (error) {
        console.error('Update payment credentials error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
