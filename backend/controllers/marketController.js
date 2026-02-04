const { Crop, Bid, Transaction, User, sequelize } = require('../models');
const redisClient = require('../config/redis');
const smsService = require('../services/smsService');
const mlService = require('../services/mlService');
const { Op } = require('sequelize');

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
        const {
            page = 1,
            limit = 20,
            search,
            crop_name,
            min_price,
            max_price,
            quality,
            location,
            farmer_id,
            status = 'listed'
        } = req.query;

        const offset = (page - 1) * limit;
        const where = { status };

        // Apply filters
        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (crop_name) {
            where.name = { [Op.iLike]: `%${crop_name}%` };
        }

        if (min_price || max_price) {
            where.current_price = {};
            if (min_price) where.current_price[Op.gte] = parseFloat(min_price);
            if (max_price) where.current_price[Op.lte] = parseFloat(max_price);
        }

        if (quality) {
            where.quality_grade = quality;
        }

        if (location) {
            where.location = { [Op.contains]: { district: location } };
        }

        if (farmer_id) {
            where.farmer_id = farmer_id;
        }

        const { count, rows: crops } = await Crop.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
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

        // Cache popular crops
        if (page === 1) {
            await redisClient.setEx(
                'popular_crops',
                3600,
                JSON.stringify(crops.slice(0, 10))
            );
        }

        res.json({
            crops,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: Math.ceil(count / limit)
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

        // Try cache first
        const cachedCrop = await redisClient.get(`crop:${id}`);
        if (cachedCrop) {
            return res.json(JSON.parse(cachedCrop));
        }

        const crop = await Crop.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'farmer',
                    attributes: ['id', 'name', 'phone', 'location'],
                    include: [
                        {
                            model: require('../models/farmerProfile'),
                            attributes: ['experience_years', 'primary_crops', 'farm_size']
                        }
                    ]
                },
                {
                    model: Bid,
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
        await crop.update({ view_count: crop.view_count + 1 });

        // Get market insights
        const insights = await mlService.getMarketInsights({
            crop: crop.name,
            location: crop.location?.district
        });

        const response = {
            crop,
            insights,
            similar_crops: await getSimilarCrops(crop)
        };

        // Cache for 5 minutes
        await redisClient.setEx(`crop:${id}`, 300, JSON.stringify(response));

        res.json(response);
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

        // Check if bid end date has passed
        if (crop.bid_end_date && new Date(crop.bid_end_date) < new Date()) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Bidding period has ended' });
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
        await crop.update({
            bid_count: crop.bid_count + 1,
            current_price: parseFloat(amount) > crop.current_price ? amount : crop.current_price
        }, { transaction });

        // Update highest bid flag
        await Bid.update(
            { is_highest: false },
            {
                where: {
                    crop_id,
                    id: { [Op.ne]: bid.id }
                },
                transaction
            }
        );

        await Bid.update(
            { is_highest: true },
            {
                where: { id: bid.id },
                transaction
            }
        );

        // Notify farmer about new bid
        const farmer = await User.findByPk(crop.farmer_id);
        if (farmer.phone) {
            await smsService.sendSMS(
                farmer.phone,
                `New bid ₹${amount} placed on your ${crop.name}. Check your app for details.`
            );
        }

        await transaction.commit();

        // Emit real-time update
        try {
            const { io } = require('../server');
            if (io) {
                io.to(`crop-${crop_id}`).emit('newBid', {
                    bid,
                    buyer: req.user.name,
                    crop_id
                });
            }
        } catch (e) {
            console.warn('Socket.io emit failed', e);
        }

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

        // Verify farmer owns the crop
        if (bid.crop.farmer_id !== farmerId) {
            await transaction.rollback();
            return res.status(403).json({ error: 'Not authorized to respond to this bid' });
        }

        if (bid.status !== 'pending') {
            await transaction.rollback();
            return res.status(400).json({ error: 'Bid already responded to' });
        }

        let updateData = {};
        let message = '';

        switch (action) {
            case 'accept':
                updateData = { status: 'accepted' };
                message = 'Bid accepted';

                // Update crop status
                await Crop.update(
                    { status: 'reserved' },
                    { where: { id: bid.crop_id }, transaction }
                );

                // Create transaction
                await Transaction.create({
                    crop_id: bid.crop_id,
                    farmer_id: farmerId,
                    buyer_id: bid.buyer_id,
                    final_price: bid.amount,
                    status: 'confirmed'
                }, { transaction });

                // Notify buyer
                const buyer = await User.findByPk(bid.buyer_id);
                if (buyer.phone) {
                    await smsService.sendSMS(
                        buyer.phone,
                        `Your bid of ₹${bid.amount} has been accepted for ${bid.crop.name}.`
                    );
                }
                break;

            case 'reject':
                updateData = { status: 'rejected' };
                message = 'Bid rejected';
                break;

            case 'counter':
                if (!counter_amount) {
                    await transaction.rollback();
                    return res.status(400).json({ error: 'Counter amount is required' });
                }
                updateData = {
                    status: 'countered',
                    counter_amount: parseFloat(counter_amount)
                };
                message = 'Counter offer sent';

                // Add to negotiation history
                const negotiation = {
                    type: 'counter',
                    amount: counter_amount,
                    timestamp: new Date(),
                    by: 'farmer'
                };
                updateData.negotiation_history = [
                    ...(bid.negotiation_history || []),
                    negotiation
                ];
                break;

            default:
                await transaction.rollback();
                return res.status(400).json({ error: 'Invalid action' });
        }

        await Bid.update(updateData, {
            where: { id: bid_id },
            transaction
        });

        await transaction.commit();

        // Emit real-time update
        try {
            const { io } = require('../server');
            if (io) {
                io.to(`crop-${bid.crop_id}`).emit('bidResponse', {
                    bid_id,
                    action,
                    counter_amount,
                    updated_by: req.user.name
                });
            }
        } catch (e) {
            console.warn('Socket.io emit failed', e);
        }

        res.json({
            message,
            bid: await Bid.findByPk(bid_id)
        });
    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        console.error('Respond to bid error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getPriceHistory = async (req, res) => {
    try {
        const { crop, location, days = 30 } = req.query;

        // Try cache first
        const cacheKey = `price_history:${crop}:${location}:${days}`;
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            return res.json(JSON.parse(cachedData));
        }

        const priceHistory = await mlService.getPriceHistory({
            crop,
            location,
            days: parseInt(days)
        });

        // Cache for 1 hour
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(priceHistory));

        res.json(priceHistory);
    } catch (error) {
        console.error('Get price history error:', error);
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
