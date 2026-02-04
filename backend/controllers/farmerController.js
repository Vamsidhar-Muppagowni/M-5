const { Crop, Bid, Transaction, sequelize } = require('../models');

exports.getStats = async (req, res) => {
    try {
        const farmerId = req.user.id;

        const activeListings = await Crop.count({
            where: { farmer_id: farmerId, status: 'listed' }
        });

        const totalSales = await Transaction.count({
            where: { farmer_id: farmerId }
        });

        // Calculate total earnings
        const transactions = await Transaction.findAll({
            where: { farmer_id: farmerId },
            attributes: ['final_price']
        });
        const earnings = transactions.reduce((sum, t) => sum + parseFloat(t.final_price), 0);

        // Pending Bids
        // Count bids on crops owned by farmer where status is pending
        // This requires a join or two queries
        // simpler: Get all my crops, then count bids. Or association.
        // Crop.hasMany(Bid)

        // We can do it via raw query or include. 
        // Let's iterate crops or use a targeted count.
        // Better: Count Bid where crop.farmer_id = farmerId and status = pending. 
        // But Bid table doesn't have farmer_id directly. It has crop_id.
        // So include Crop.
        const pendingBids = await Bid.count({
            include: [{
                model: Crop,
                where: { farmer_id: farmerId }
            }],
            where: { status: 'pending' }
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
