const { Crop, Bid, User, PriceHistory, FarmerProfile } = require('../models');
const redisClient = require('../config/redis');
const smsService = require('../services/smsService');
const mlService = require('../services/mlService');
const mongoose = require('mongoose');

// Helper for seeding data if empty
const seedMarketData = async () => {
    try {
        const cropCount = await Crop.countDocuments();
        if (cropCount > 0) return;

        console.log('Seeding market data...');

        // Find a farmer to assign crops to
        let farmer = await User.findOne({ user_type: 'farmer' });
        if (!farmer) {
            // Create a dummy farmer if none exists
            farmer = await User.create({
                phone: '9999999999',
                name: 'Ramesh Kumar',
                password: 'password123',
                user_type: 'farmer',
                location: { district: 'Guntur', state: 'Andhra Pradesh' },
                is_active: true
            });
            await FarmerProfile.create({ user: farmer._id });
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
                farmer: farmer._id
            });
        }

        // Seed Price History for Chart
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
    const session = await mongoose.startSession();
    session.startTransaction();

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
            bid_end_date,
            images
        } = req.body;

        // Validate images (0-10 allowed, images are optional)
        if (images && !Array.isArray(images)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'Images must be an array' });
        }
        if (images && images.length > 10) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'Maximum 10 images allowed' });
        }

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

        const crop = await Crop.create([{
            farmer: farmerId,
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
            images: images || [],
            status: 'listed'
        }], { session });

        // Get price prediction for this crop
        const pricePrediction = await mlService.predictPrice({
            crop: name,
            location: location?.district,
            days: 7
        });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: 'Crop listed successfully',
            crop: crop[0],
            price_prediction: pricePrediction
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
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
        const skip = (pageInt - 1) * limitInt;

        const query = { status };

        // Apply filters
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { variety: { $regex: search, $options: 'i' } }
            ];
        }

        if (crop_name) {
            query.name = { $regex: crop_name, $options: 'i' };
        }

        if (min_price || max_price) {
            query.current_price = {};
            if (min_price) query.current_price.$gte = parseFloat(min_price);
            if (max_price) query.current_price.$lte = parseFloat(max_price);
        }

        if (quality) {
            query.quality_grade = quality;
        }

        if (farmer_id) {
            query.farmer = farmer_id;
        }

        const totalItems = await Crop.countDocuments(query);
        const crops = await Crop.find(query)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limitInt)
            .populate('farmer', 'name phone location')
            // To get top 5 bids, Mongoose needs virtual populate or separate query
            // For simplicity, we won't embed top bids in listing view to save bandwidth
            // unless essential. If needed, we'd do aggregation.
            // Let's rely on getCropDetails for bids.
            .lean();

        // Manual mapping if needed, but lean() + populate works well

        const totalPages = Math.ceil(totalItems / limitInt) || 0;

        res.json({
            crops,
            pagination: {
                page: pageInt,
                totalPages,
                totalItems
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

        // basic validation for ObjectId
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid crop ID' });
        }

        // In Mongoose, getting top 5 bids requires specific query logic often not simple 'populate' with limit/sort
        // We can do a second query for bids
        const crop = await Crop.findById(id)
            .populate({
                path: 'farmer',
                select: 'name phone location',
                populate: {
                    path: 'farmerProfile', // This is a virtual if defined in User, or use direct query
                    // In my User model I added farmerProfile as direct ref
                    select: 'experience_years farm_size major_crops'
                }
            });

        if (!crop) {
            return res.status(404).json({ error: 'Crop not found' });
        }

        // Get bids separately to sort and limit
        const bids = await Bid.find({ crop: id })
            .sort({ amount: -1 })
            .limit(5)
            .populate('buyer', 'name phone');

        // Increment view count
        crop.view_count += 1;
        await crop.save();

        // Get market insights
        const insights = await mlService.getMarketInsights({
            crop: crop.name,
            location: crop.location?.district
        });

        const cropJson = crop.toJSON();
        cropJson.bids = bids; // attach bids structure manually to match expected frontend

        res.json({
            crop: cropJson,
            insights,
            similar_crops: await getSimilarCrops(crop)
        });
    } catch (error) {
        console.error('Get crop details error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.placeBid = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const buyerId = req.user.id;
        const { crop_id, amount, message } = req.body;

        const crop = await Crop.findById(crop_id).session(session);
        if (!crop) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Crop not found' });
        }

        if (crop.farmer.toString() === buyerId) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'You cannot bid on your own crop' });
        }

        if (crop.status !== 'listed') {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Crop is not available for bidding' });
        }

        if (parseFloat(amount) < crop.min_price) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Bid amount is below minimum price' });
        }

        const bid = await Bid.create([{
            crop: crop_id,
            buyer: buyerId,
            farmer: crop.farmer,
            amount: parseFloat(amount),
            message,
            status: 'pending'
        }], { session });

        crop.bid_count += 1;
        if (parseFloat(amount) > crop.current_price) {
            crop.current_price = parseFloat(amount);
        }
        await crop.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: 'Bid placed successfully',
            bid: bid[0]
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();
        console.error('Place bid error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.respondToBid = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const farmerId = req.user.id;
        const { bid_id, action, counter_amount } = req.body;

        const bid = await Bid.findById(bid_id).populate('crop').session(session);

        if (!bid) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Bid not found' });
        }

        // Check ownership via crop relationship or direct farmer field on bid
        if (bid.farmer.toString() !== farmerId) {
            await session.abortTransaction();
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (action === 'accept') {
            bid.status = 'accepted';
            // Mark crop as reserved
            await Crop.findByIdAndUpdate(bid.crop._id, { status: 'reserved' }, { session });
        } else if (action === 'reject') {
            bid.status = 'rejected';
        } else if (action === 'counter') {
            bid.status = 'countered';
            bid.counter_amount = counter_amount;
        }

        await bid.save({ session });
        await session.commitTransaction();
        session.endSession();

        res.json({ message: `Bid ${action}ed`, bid });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();
        console.error('Respond bid error', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getPriceHistory = async (req, res) => {
    try {
        await seedMarketData();

        let { crop } = req.query;

        if (!crop) {
            const firstEntry = await PriceHistory.findOne().sort({ date: -1 });
            crop = firstEntry ? firstEntry.crop_name : 'Wheat';
        }

        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);

        const history = await PriceHistory.find({
            crop_name: crop,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ date: 1 });

        // Aggregate by month
        const monthlyData = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthLabel = d.toLocaleString('default', { month: 'short' });
            monthlyData[monthLabel] = { total: 0, count: 0 };
        }

        history.forEach(record => {
            const d = new Date(record.date);
            const monthLabel = d.toLocaleString('default', { month: 'short' });
            if (!monthlyData[monthLabel]) monthlyData[monthLabel] = { total: 0, count: 0 };
            monthlyData[monthLabel].total += record.price;
            monthlyData[monthLabel].count += 1;
        });

        const finalLabels = [];
        const finalData = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthLabel = d.toLocaleString('default', { month: 'short' });
            finalLabels.push(monthLabel);
            if (monthlyData[monthLabel] && monthlyData[monthLabel].count > 0) {
                finalData.push(Math.round(monthlyData[monthLabel].total / monthlyData[monthLabel].count));
            } else {
                finalData.push(finalData.length > 0 ? finalData[finalData.length - 1] : 0);
            }
        }

        res.json({
            crop,
            labels: finalLabels,
            datasets: [{ data: finalData }]
        });
    } catch (error) {
        console.error('Get price history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getRecentPrices = async (req, res) => {
    try {
        const recent = await PriceHistory.find().sort({ date: -1 }).limit(5);
        const formatted = recent.map(p => ({
            id: p._id.toString(),
            crop: p.crop_name,
            price: p.price.toString(),
            date: p.date.toISOString().split('T')[0]
        }));

        if (formatted.length === 0) {
            const crops = await Crop.find().limit(5).sort({ updated_at: -1 });
            const fallback = crops.map(c => ({
                id: c._id,
                crop: c.name,
                price: c.current_price,
                date: c.updated_at.toISOString().split('T')[0]
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
        const bids = await Bid.find({
            farmer: farmerId,
            status: 'pending'
        })
            .sort({ created_at: -1 })
            .populate('crop', 'name status current_price min_price unit')
            .populate('buyer', 'name phone location');

        res.json({ bids });
    } catch (error) {
        console.error('Get farmer received bids error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getBuyerBids = async (req, res) => {
    try {
        const buyerId = req.user.id;
        const bids = await Bid.find({ buyer: buyerId })
            .sort({ created_at: -1 })
            .populate({
                path: 'crop',
                select: 'name min_price current_price unit status images',
                populate: {
                    path: 'farmer',
                    select: 'name phone'
                }
            });

        res.json({ bids });
    } catch (error) {
        console.error('Get buyer bids error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

async function getSimilarCrops(crop) {
    return await Crop.find({
        name: crop.name,
        _id: { $ne: crop._id },
        status: 'listed'
    }).limit(5).sort({ created_at: -1 });
}

