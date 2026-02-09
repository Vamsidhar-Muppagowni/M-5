const { Crop, Bid, Transaction, User, PriceHistory, sequelize } = require('../models');
const redisClient = require('../config/redis');
const smsService = require('../services/smsService');
const mlService = require('../services/mlService');
const { Op } = require('sequelize');

// Helper for seeding data if empty
const seedMarketData = async () => {
    try {
        const cropCount = await Crop.count();
        if (cropCount > 0) return;

        console.log('Seeding market data...');

        // Find a farmer to assign crops to
        let farmer = await User.findOne({ where: { user_type: 'farmer' } });
        if (!farmer) {
            // Create a dummy farmer if none exists
            farmer = await User.create({
                phone: '9999999999',
                name: 'Ramesh Kumar',
                password: 'password123',
                user_type: 'farmer',
                location: { district: 'Guntur', state: 'Andhra Pradesh' },
                is_verified: true
            });
            await require('../models/farmerProfile').create({ user_id: farmer.id });
        }

        const crops = [
            {
                name: 'Cotton',
                variety: 'Bt Cotton',
                quantity: 500,
                unit: 'kg',
                quality_grade: 'A',
                min_price: 5500,
                current_price: 6000,
                location: { district: 'Guntur', state: 'Andhra Pradesh' },
                status: 'listed'
            },
            {
                name: 'Chilli',
                variety: 'Guntur Sannam',
                quantity: 200,
                unit: 'kg',
                quality_grade: 'A',
                min_price: 18000,
                current_price: 20000,
                location: { district: 'Guntur', state: 'Andhra Pradesh' },
                status: 'listed'
            },
            {
                name: 'Rice',
                variety: 'Sona Masoori',
                quantity: 1000,
                unit: 'kg',
                quality_grade: 'B',
                min_price: 2500,
                current_price: 2800,
                location: { district: 'Nellore', state: 'Andhra Pradesh' },
                status: 'listed'
            },
            {
                name: 'Wheat',
                variety: 'Sharbati',
                quantity: 800,
                unit: 'kg',
                quality_grade: 'A',
                min_price: 2200,
                current_price: 2400,
                location: { district: 'Vidisha', state: 'Madhya Pradesh' },
                status: 'listed'
            }
        ];

        for (const cropData of crops) {
            await Crop.create({
                ...cropData,
                farmer_id: farmer.id
            });
        }

        // Seed Price History for Chart
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const basePrices = { 'Wheat': 2000, 'Rice': 2500, 'Cotton': 5000, 'Chilli': 15000 };

        for (const cropName of Object.keys(basePrices)) {
            for (let i = 0; i < 6; i++) {
                // Approximate past dates
                const date = new Date();
                date.setMonth(date.getMonth() - (5 - i));
                date.setDate(15);

                await PriceHistory.create({
                    crop_name: cropName,
                    market_name: 'Guntur Market',
                    price: basePrices[cropName] + (Math.random() * 500 - 250),
                    date: date,
                    quality: 'A',
                    region: 'Guntur'
                });
            }
        }

        console.log('Market data seeded successfully');

    } catch (error) {
        console.error('Seeding error:', error);
    }
};

exports.listCrop = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const farmerId = req.user.id;
        const {
            name,
            variety,
            quantity,
            unit,
            quality_grade,
            min_price,
            current_price,
            description,
            location,
            harvest_date,
            expiry_date,
            bid_end_date
        } = req.body;

        // Get recommended price if not provided
        let finalPrice = current_price;
        if (!current_price) {
            const recommendedPrice = await mlService.getRecommendedPrice({
                crop: name,
                quality: quality_grade,
                location: location?.district,
                quantity
            });
            finalPrice = recommendedPrice || min_price;
        }

        const crop = await Crop.create({
            farmer_id: farmerId,
            name,
            variety,
            quantity: parseFloat(quantity),
            unit: unit || 'kg',
            quality_grade,
            min_price: parseFloat(min_price),
            current_price: parseFloat(finalPrice),
            description,
            location: location || {},
            harvest_date,
            expiry_date,
            bid_end_date,
            status: 'listed'
        }, { transaction });

        // Get price prediction for this crop
        const pricePrediction = await mlService.predictPrice({
            crop: name,
            location: location?.district,
            days: 7
        });

        await transaction.commit();

        res.status(201).json({
            message: 'Crop listed successfully',
            crop,
            price_prediction: pricePrediction
        });
    } catch (error) {
        await transaction.rollback();
        console.error('List crop error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getCrops = async (req, res) => {
    try {
        // Trigger seeding if needed
        await seedMarketData();

        const {
            page = 1,
            limit = 10,
            search,
            crop_name,
            min_price,
            max_price,
            quality,
            location,
            farmer_id,
            status = 'listed'
        } = req.query;

        const limitInt = parseInt(limit) || 10;
        const pageInt = parseInt(page) || 1;
        const offset = (pageInt - 1) * limitInt;

        const where = { status };

        // Apply filters
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } }, // SQLite uses LIKE
                { description: { [Op.like]: `%${search}%` } },
                { variety: { [Op.like]: `%${search}%` } }
            ];
        }

        if (crop_name) {
            where.name = { [Op.like]: `%${crop_name}%` };
        }

        if (min_price || max_price) {
            where.current_price = {};
            if (min_price) where.current_price[Op.gte] = parseFloat(min_price);
            if (max_price) where.current_price[Op.lte] = parseFloat(max_price);
        }

        if (quality) {
            where.quality_grade = quality;
        }

        if (farmer_id) {
            where.farmer_id = farmer_id;
        }

        const { count, rows: cropList } = await Crop.findAndCountAll({
            where,
            limit: limitInt,
            offset: offset,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'farmer',
                    attributes: ['id', 'name', 'phone', 'location']
                },
                {
                    model: Bid,
                    limit: 5,
                    order: [['amount', 'DESC']],
                    include: [
                        {
                            model: User,
                            as: 'buyer',
                            attributes: ['id', 'name', 'phone']
                        }
                    ]
                }
            ]
        });

        // Format for frontend
        const crops = cropList.map(c => {
            const json = c.toJSON();

            // Ensure location is an object if it's a string (SQLite JSON storage quirk sometimes)
            let loc = json.location;
            if (typeof loc === 'string') {
                try { loc = JSON.parse(loc); } catch (e) { }
            }

            return {
                id: json.id,
                name: json.name,
                current_price: json.current_price,
                unit: json.unit,
                quantity: json.quantity,
                quality_grade: json.quality_grade,
                status: json.status,
                location: loc,
                farmer: json.farmer,
                // Additional fields if needed
                description: json.description,
                created_at: json.created_at
            };
        });

        // Calculate total pages safely
        const totalPages = Math.ceil(count / limitInt) || 0;

        res.json({
            crops,
            pagination: {
                page: pageInt,
                totalPages: totalPages,
                totalItems: count
            }
        });
    } catch (error) {
        console.error('Get crops error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getCropDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const crop = await Crop.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'farmer',
                    attributes: ['id', 'name', 'phone', 'location'],
                    include: [
                        {
                            model: require('../models/farmerProfile'),
                            as: 'farmer_profile', // explicit alias matching index.js usually
                            attributes: ['experience_years', 'primary_crops', 'farm_size'],
                            required: false
                        }
                    ]
                },
                {
                    model: Bid,
                    limit: 5,
                    order: [['amount', 'DESC']],
                    include: [
                        {
                            model: User,
                            as: 'buyer',
                            attributes: ['id', 'name', 'phone']
                        }
                    ]
                }
            ]
        });

        if (!crop) {
            return res.status(404).json({ error: 'Crop not found' });
        }

        // Increment view count
        await crop.increment('view_count');

        // Get market insights
        const insights = await mlService.getMarketInsights({
            crop: crop.name,
            location: crop.location?.district
        });

        res.json({
            crop,
            insights,
            similar_crops: await getSimilarCrops(crop)
        });
    } catch (error) {
        console.error('Get crop details error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.placeBid = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const buyerId = req.user.id;
        const { crop_id, amount, message } = req.body;

        // Validate buyer is not the farmer
        const crop = await Crop.findByPk(crop_id, { transaction });
        if (!crop) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Crop not found' });
        }

        if (crop.farmer_id === buyerId) {
            await transaction.rollback();
            return res.status(400).json({ error: 'You cannot bid on your own crop' });
        }

        if (crop.status !== 'listed') {
            await transaction.rollback();
            return res.status(400).json({ error: 'Crop is not available for bidding' });
        }

        if (parseFloat(amount) < parseFloat(crop.min_price)) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Bid amount is below minimum price' });
        }

        // Create bid
        const bid = await Bid.create({
            crop_id,
            buyer_id: buyerId,
            amount: parseFloat(amount),
            message,
            status: 'pending'
        }, { transaction });

        // Update crop bid count and potentially current price
        await crop.increment('bid_count', { transaction });
        if (parseFloat(amount) > parseFloat(crop.current_price)) {
            await crop.update({ current_price: amount }, { transaction });
        }

        // Update highest bid logic is complex, skipping strict strict highest flag management for simplicity
        // in this iteration, relying on queries to find highest.

        await transaction.commit();

        res.status(201).json({
            message: 'Bid placed successfully',
            bid
        });
    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        console.error('Place bid error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.respondToBid = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const farmerId = req.user.id;
        const { bid_id, action, counter_amount } = req.body;

        const bid = await Bid.findByPk(bid_id, {
            include: [Crop]
        });

        if (!bid) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Bid not found' });
        }

        if (bid.crop?.farmer_id !== farmerId && bid.Crop?.farmer_id !== farmerId) {
            await transaction.rollback();
            return res.status(403).json({ error: 'Not authorized' });
        }

        const cropId = bid.crop_id; // Safer to use FK directly if available, or fetch from bid.crop/Crop

        let updateData = {};
        if (action === 'accept') {
            updateData = { status: 'accepted' };
            await Crop.update({ status: 'reserved' }, { where: { id: bid.crop_id }, transaction });
        } else if (action === 'reject') {
            updateData = { status: 'rejected' };
        } else if (action === 'counter') {
            updateData = { status: 'countered', counter_amount };
        }

        await bid.update(updateData, { transaction });
        await transaction.commit();

        res.json({ message: `Bid ${action}ed`, bid });
    } catch (error) {
        try {
            if (transaction && !transaction.finished) await transaction.rollback();
        } catch (rollbackError) {
            console.error('Rollback error:', rollbackError);
        }
        console.error('Respond bid error', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getPriceHistory = async (req, res) => {
    try {
        await seedMarketData();

        let { crop } = req.query;

        // 1. If no crop provided, default to the first available one in PriceHistory
        if (!crop) {
            const firstEntry = await PriceHistory.findOne({
                attributes: ['crop_name'],
                order: [['date', 'DESC']]
            });
            crop = firstEntry ? firstEntry.crop_name : 'Wheat';
        }

        // 2. Calculate date range (Last 6 months)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);

        // 3. Fetch history
        const history = await PriceHistory.findAll({
            where: {
                crop_name: crop,
                date: {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate
                }
            },
            order: [['date', 'ASC']]
        });

        // 4. Aggregate by month (Average price per month)
        const monthlyData = {};

        // Initialize last 6 months to ensure continuous labels even if missing data
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthLabel = d.toLocaleString('default', { month: 'short' });
            monthlyData[monthLabel] = { total: 0, count: 0 };
        }

        history.forEach(record => {
            const d = new Date(record.date);
            const monthLabel = d.toLocaleString('default', { month: 'short' });

            // Adjust to fit into our initialized windows or just use actual data
            // For strict 6 months, using the record's actual month is better
            if (!monthlyData[monthLabel]) monthlyData[monthLabel] = { total: 0, count: 0 };

            monthlyData[monthLabel].total += parseFloat(record.price);
            monthlyData[monthLabel].count += 1;
        });

        // 5. Format for Chart.js
        const finalLabels = [];
        const finalData = [];

        // Re-construct labels based on chronological time to ensure sort order
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthLabel = d.toLocaleString('default', { month: 'short' });

            finalLabels.push(monthLabel); // "Sept", "Oct"

            if (monthlyData[monthLabel] && monthlyData[monthLabel].count > 0) {
                finalData.push(Math.round(monthlyData[monthLabel].total / monthlyData[monthLabel].count));
            } else {
                // If no data for this month, carry forward previous or 0
                finalData.push(finalData.length > 0 ? finalData[finalData.length - 1] : 0);
            }
        }

        // 6. Return response
        res.json({
            crop: crop,
            labels: finalLabels,
            datasets: [
                {
                    data: finalData,
                    strokeWidth: 2
                }
            ]
        });

    } catch (error) {
        console.error('Get price history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getRecentPrices = async (req, res) => {
    try {
        // Return latest price entries provided solely for the "Recent Market Updates" list
        // Frontend expects: [{ id, crop, price, date }]

        const recent = await PriceHistory.findAll({
            order: [['date', 'DESC']],
            limit: 5
        });

        const formatted = recent.map(p => ({
            id: p.id.toString(),
            crop: p.crop_name,
            price: p.price.toString(), // or formatted string
            date: p.date // YYYY-MM-DD usually returned by sequelize DATEONLY
        }));

        // Fallback if empty
        if (formatted.length === 0) {
            const crops = await Crop.findAll({ limit: 5, order: [['updated_at', 'DESC']] });
            const fallback = crops.map(c => ({
                id: c.id,
                crop: c.name,
                price: c.current_price,
                date: new Date(c.updated_at).toISOString().split('T')[0]
            }));
            return res.json(fallback);
        }

        res.json(formatted);
    } catch (error) {
        console.error('Get recent prices error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getFarmerReceivedBids = async (req, res) => {
    try {
        const farmerId = req.user.id;

        // Find all bids for crops owned by this farmer
        const bids = await Bid.findAll({
            where: { status: 'pending' },
            include: [
                {
                    model: Crop,
                    where: { farmer_id: farmerId },
                    attributes: ['id', 'name', 'status', 'current_price', 'min_price', 'unit']
                },
                {
                    model: User,
                    as: 'buyer', // Assuming alias is 'buyer' from other controller methods
                    attributes: ['id', 'name', 'phone', 'location']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({ bids });
    } catch (error) {
        console.error('Get farmer received bids error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Helper function
async function getSimilarCrops(crop) {
    return await Crop.findAll({
        where: {
            name: crop.name,
            id: { [Op.ne]: crop.id },
            status: 'listed'
        },
        limit: 5,
        order: [['created_at', 'DESC']]
    });
}

