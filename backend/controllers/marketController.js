const {
    Crop,
    Bid,
    User,
    PriceHistory,
    FarmerProfile,
    PriceAlert,
    Notification
} = require('../models');
const redisClient = require('../config/redis');
const smsService = require('../services/smsService');
const mlService = require('../services/mlService');
const priceAnalysisService = require('../services/priceAnalysisService');
const suggestedPriceService = require('../services/suggestedPriceService');
const mongoose = require('mongoose');

/**
 * Market Controller
 * 
 * This controller handles all market-related operations including:
 * - Listing crops for sale
 * - Managing bids (placing, responding)
 * - Retrieving market prices and history
 * - Seeding initial market data for demonstration
 */


/**
 * List a new crop for sale.
 * Handles image validation, price recommendation (if not set),
 * and creates the crop listing.
 */
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
            return res.status(400).json({
                error: 'Images must be an array'
            });
        }
        if (images && images.length > 10) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                error: 'Maximum 10 images allowed'
            });
        }

        // Get recommended price if not provided
        let finalPrice = current_price;
        if (!current_price) {
            const recommendedPrice = await mlService.getRecommendedPrice({
                crop: name,
                quality: quality_grade,
                location: location && location.district,
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
        }], {
            session
        });

        // Get price prediction for this crop
        const pricePrediction = await mlService.predictPrice({
            crop: name,
            location: location && location.district,
            days: 7
        });

        // Trigger Price Alerts
        const activeAlerts = await PriceAlert.find({
            crop_name: {
                $regex: new RegExp(`^${name}$`, 'i')
            },
            is_active: true,
            target_price: {
                $lte: finalPrice
            }
        });

        if (activeAlerts.length > 0) {
            const notifications = activeAlerts.map(alert => ({
                user: alert.farmer,
                title: 'Price Alert Triggered! 🚀',
                message: `${name} has reached your target price of ₹${alert.target_price}. Current price is ₹${finalPrice}.`,
                type: 'info',
                is_read: false
            }));
            await Notification.create(notifications, {
                session
            });

            // Auto-disable alerts that have been triggered if requested, 
            // but for now let's just leave them or disable them based on common behavior.
            // Let's disable them so they don't spam.
            const alertIds = activeAlerts.map(a => a._id);
            await PriceAlert.updateMany({
                _id: {
                    $in: alertIds
                }
            }, {
                $set: {
                    is_active: false
                }
            }, {
                session
            });
        }

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
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

/**
 * Get all crops with filtering and pagination.
 * Supports filtering by name, price range, quality, and location.
 */
exports.getCrops = async (req, res) => {
    try {
        // Trigger seeding if needed
        // await seedMarketData();

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

        const query = {
            status
        };

        // Apply filters
        if (search) {
            query.$or = [{
                    name: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {
                    description: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {
                    variety: {
                        $regex: search,
                        $options: 'i'
                    }
                }
            ];
        }

        if (crop_name) {
            query.name = {
                $regex: crop_name,
                $options: 'i'
            };
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
            .sort({
                created_at: -1
            })
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
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

/**
 * Get unique crop names from the database for dropdowns
 */
exports.getUniqueCrops = async (req, res) => {
    try {
        const cropNames = await Crop.distinct('name');

        // Standardize formatting to prevent duplicates like "Cotton" vs "cotton"
        const formattedNames = cropNames.map(name => {
            if (!name) return '';
            const trimmed = name.trim().toLowerCase();
            return trimmed.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }).filter(name => name.length > 0);

        // Remove any resulting duplicates
        const uniqueNames = [...new Set(formattedNames)];

        res.json({
            crops: uniqueNames
        });
    } catch (error) {
        console.error('Get unique crops error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

/**
 * Get detailed information about a specific crop.
 * Includes farmer details, top bids, and market insights.
 * Increments the view count for the crop.
 */
exports.getCropDetails = async (req, res) => {
    try {
        const {
            id
        } = req.params;

        // basic validation for ObjectId
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                error: 'Invalid crop ID'
            });
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
            return res.status(404).json({
                error: 'Crop not found'
            });
        }

        // Get bids separately to sort and limit
        const bids = await Bid.find({
                crop: id
            })
            .sort({
                amount: -1
            })
            .limit(5)
            .populate('buyer', 'name phone');

        // Increment view count
        crop.view_count += 1;
        await crop.save();

        // Get market insights
        const insights = await mlService.getMarketInsights({
            crop: crop.name,
            location: crop.location && crop.location.district
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
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

/**
 * Place a bid on a crop.
 * Validates that the buyer is not the farmer, crop is listed,
 * and bid amount is valid. Updates crop's current price if bid is higher.
 */
exports.placeBid = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const buyerId = req.user.id;
        const {
            crop_id,
            amount,
            message
        } = req.body;

        const crop = await Crop.findById(crop_id).session(session);
        if (!crop) {
            await session.abortTransaction();
            return res.status(404).json({
                error: 'Crop not found'
            });
        }

        if (crop.farmer.toString() === buyerId) {
            await session.abortTransaction();
            return res.status(400).json({
                error: 'You cannot bid on your own crop'
            });
        }

        if (crop.status !== 'listed') {
            await session.abortTransaction();
            return res.status(400).json({
                error: 'Crop is not available for bidding'
            });
        }

        if (parseFloat(amount) < crop.min_price) {
            await session.abortTransaction();
            return res.status(400).json({
                error: 'Bid amount is below minimum price'
            });
        }

        const bid = await Bid.create([{
            crop: crop_id,
            buyer: buyerId,
            farmer: crop.farmer,
            amount: parseFloat(amount),
            message,
            status: 'pending'
        }], {
            session
        });

        crop.bid_count += 1;
        if (parseFloat(amount) > crop.current_price) {
            crop.current_price = parseFloat(amount);
        }
        await crop.save({
            session
        });

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
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

/**
 * Respond to a bid (Accept/Reject/Counter).
 * Only the farmer who listed the crop can respond.
 * Accepting a bid marks the crop as reserved.
 */
exports.respondToBid = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const farmerId = req.user.id;
        const {
            bid_id,
            action,
            counter_amount
        } = req.body;

        const bid = await Bid.findById(bid_id).populate('crop').session(session);

        if (!bid) {
            await session.abortTransaction();
            return res.status(404).json({
                error: 'Bid not found'
            });
        }

        // Check ownership via crop relationship or direct farmer field on bid
        if (bid.farmer.toString() !== farmerId) {
            await session.abortTransaction();
            return res.status(403).json({
                error: 'Not authorized'
            });
        }

        if (action === 'accept') {
            bid.status = 'accepted';
            // Mark crop as reserved
            await Crop.findByIdAndUpdate(bid.crop._id, {
                status: 'reserved'
            }, {
                session
            });
        } else if (action === 'reject') {
            bid.status = 'rejected';
        } else if (action === 'counter') {
            bid.status = 'countered';
            bid.counter_amount = counter_amount;
        }

        await bid.save({
            session
        });
        await session.commitTransaction();
        session.endSession();

        res.json({
            message: `Bid ${action}ed`,
            bid
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();
        console.error('Respond bid error', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

/**
 * Get historical price data for a crop.
 * Used for generating charts in the frontend.
 * Aggregates data by month.
 */
exports.getPriceHistory = async (req, res) => {
    try {
        // Require crop query param — never default to a global value
        const selectedCropName = (req.query.crop || '').trim();
        if (!selectedCropName) {
            return res.status(400).json({
                error: 'crop query parameter is required'
            });
        }

        const normalizedName = selectedCropName.trim().toLowerCase();

        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);

        // Check Redis cache first
        const cacheKeyParam = normalizedName;
        const cachedAnalysis = await priceAnalysisService.getCachedAnalysis(cacheKeyParam);
        if (cachedAnalysis) {
            return res.json(cachedAnalysis);
        }

        const history = await PriceHistory.find({
            cropName: normalizedName,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({
            date: 1
        }).lean();

        if (history.length === 0) {
            return res.status(200).json({
                message: "No price history available for this crop"
            });
        }

        // Build empty month buckets for chart representation
        const monthlyData = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const label = d.toLocaleString('default', {
                month: 'short'
            });
            monthlyData[label] = {
                total: 0,
                count: 0
            };
        }

        history.forEach(record => {
            const label = new Date(record.date).toLocaleString('default', {
                month: 'short'
            });
            if (!monthlyData[label]) monthlyData[label] = {
                total: 0,
                count: 0
            };
            monthlyData[label].total += record.price;
            monthlyData[label].count += 1;
        });

        const finalLabels = [];
        const finalData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const label = d.toLocaleString('default', {
                month: 'short'
            });
            finalLabels.push(label);
            if (monthlyData[label] && monthlyData[label].count > 0) {
                finalData.push(Math.round(monthlyData[label].total / monthlyData[label].count));
            } else {
                finalData.push(finalData.length > 0 ? finalData[finalData.length - 1] : 0);
            }
        }

        // STEP 1: Fetch all recent price history to calculate metrics strictly per crop
        const recentRecords = await PriceHistory.find({
                cropName: normalizedName
            })
            .sort({
                date: -1
            })
            .lean();

        // Use the 6 month history that was fetched earlier for logical consistency
        // as directed in the task: 6-month trend %, standard deviation of 6 month prices.
        const trendPercentage = priceAnalysisService.calculateTrendPercentage(history);
        const trendStr = priceAnalysisService.determineTrendLabel(trendPercentage);
        const volatilityStr = priceAnalysisService.calculateVolatility(history);
        const confidenceScore = priceAnalysisService.calculateConfidence(history, volatilityStr);
        const momentumObj = priceAnalysisService.calculateMomentum(history);

        // STEP 2: Compute currentPrice, 30DayAverage
        const currentPrice = recentRecords.length > 0 ? recentRecords[0].price : 0;

        // 30-Day Average
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const last30Days = recentRecords.filter(p => new Date(p.date) >= thirtyDaysAgo);

        let thirtyDayAverage = 0;
        if (last30Days.length > 0) {
            thirtyDayAverage = last30Days.reduce((acc, p) => acc + p.price, 0) / last30Days.length;
        } else if (currentPrice > 0) {
            thirtyDayAverage = currentPrice;
        }

        // STEP 3: Generate Recommendation (AI Smart Advice)
        // Kept original logic structure, but using the 6-month trend.
        let recommendation = 'No Data';
        if (currentPrice > 0 && thirtyDayAverage > 0) {
            if (currentPrice > thirtyDayAverage && trendStr === 'increasing') {
                recommendation = 'Strong Sell (Favorable)';
            } else if (trendStr === 'increasing') {
                recommendation = 'Hold (Prices Rising)';
            } else if (trendStr === 'decreasing') {
                recommendation = 'Sell Before Drop';
            } else {
                recommendation = 'Stable - Evaluate Needs';
            }
        }

        // STEP 4: Calculate Suggested Price
        const suggestedPrice = suggestedPriceService.generateSuggestedPrice({
            currentPrice,
            trendPercentage: (currentPrice > 0 && thirtyDayAverage > 0) ? ((currentPrice - thirtyDayAverage) / thirtyDayAverage) * 100 : trendPercentage,
            volatility: volatilityStr,
            confidence: confidenceScore
        });

        const responseData = {
            crop: selectedCropName,
            labels: finalLabels,
            datasets: [{
                data: finalData
            }],
            trend: trendStr,
            recommendation,
            suggestedPrice, // <--- New output added
            confidence: parseFloat(confidenceScore.toFixed(2)),
            current_price: currentPrice,
            thirty_day_average: parseFloat(thirtyDayAverage.toFixed(2)),
            volatility: volatilityStr,
            momentum: momentumObj
        };

        // Cache the response object (TTL = 10 minutes configured in service)
        await priceAnalysisService.setCachedAnalysis(cacheKeyParam, responseData);

        return res.json(responseData);
    } catch (error) {
        console.error('Get price history error:', error);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
};

/**
 * Get AI Suggested Selling Price
 */
exports.getSuggestedPrice = async (req, res) => {
    try {
        const selectedCropName = (req.query.crop || '').trim();
        if (!selectedCropName) return res.status(400).json({
            error: 'Crop name is required'
        });

        const normalizedName = selectedCropName.trim().toLowerCase();

        // Fetch recent crop price history
        const recentRecords = await PriceHistory.find({
                cropName: normalizedName
            })
            .sort({
                date: -1
            })
            .limit(30)
            .lean();

        if (recentRecords.length === 0) {
            return res.status(200).json({
                message: "No price history available for this crop"
            });
        }

        // Calculate suggestedPrice based on trend
        const currentPrice = recentRecords[0].price;

        // 5-Day Trend
        let trendStr = 'stable';
        const last5Days = [...recentRecords].slice(0, 5).reverse();
        if (last5Days.length >= 2) {
            const first = last5Days[0].price;
            const last = last5Days[last5Days.length - 1].price;
            if (last > first) trendStr = 'increasing';
            else if (last < first) trendStr = 'decreasing';
        }

        // Confidence based on data density
        const confidence = Math.min((recentRecords.length / 30) * 100, 100);

        let suggestedPrice = currentPrice;
        if (trendStr === 'increasing') {
            suggestedPrice = currentPrice * 1.05; // Suggest 5% higher if trend is going up
        } else if (trendStr === 'decreasing') {
            suggestedPrice = currentPrice * 0.98; // Suggest 2% lower if trend is going down
        }

        const suggestedRangeMin = suggestedPrice * 0.95;
        const suggestedRangeMax = suggestedPrice * 1.05;

        return res.json({
            suggestedPrice: Math.round(suggestedPrice),
            suggestedRangeMin: Math.round(suggestedRangeMin),
            suggestedRangeMax: Math.round(suggestedRangeMax),
            confidence: Math.round(confidence)
        });
    } catch (error) {
        console.error('Get suggested price error:', error);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
};

/**
 * Get the most recent price updates.
 * Returns the latest price history entries or fallback to recent crop listings.
 */
exports.getRecentPrices = async (req, res) => {
    try {
        // Step 1: Sort by date desc, group by crop name to remove duplicates, and pick first
        const recent = await PriceHistory.aggregate([{
                $sort: {
                    date: -1
                }
            },
            {
                $group: {
                    _id: {
                        $trim: {
                            input: {
                                $toLower: "$cropName"
                            }
                        }
                    }, // fully distinct crop grouping resilient to case/whitespace
                    latestDoc: {
                        $first: '$$ROOT'
                    }
                }
            },
            {
                $replaceRoot: {
                    newRoot: '$latestDoc'
                }
            },
            {
                $sort: {
                    date: -1
                }
            },
            {
                $limit: 10
            }
        ]);

        const formatted = recent.map(p => ({
            _id: p._id.toString(), // ensure flatlist can use _id.toString()
            crop: p.cropName,
            price: p.price.toString(),
            date: new Date(p.date).toISOString().split('T')[0]
        }));

        if (formatted.length === 0) {
            return res.status(200).json({
                message: "No price history available"
            });
        }

        return res.json(formatted);
    } catch (error) {
        console.error('Get recent prices error:', error);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
};

exports.getFarmerReceivedBids = async (req, res) => {
    try {
        const farmerId = req.user.id;
        const bids = await Bid.find({
                farmer: farmerId,
                status: 'pending'
            })
            .sort({
                created_at: -1
            })
            .populate('crop', 'name status current_price min_price unit')
            .populate('buyer', 'name phone location');

        res.json({
            bids
        });
    } catch (error) {
        console.error('Get farmer received bids error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

exports.getBuyerBids = async (req, res) => {
    try {
        const buyerId = req.user.id;
        const bids = await Bid.find({
                buyer: buyerId
            })
            .sort({
                created_at: -1
            })
            .populate({
                path: 'crop',
                select: 'name min_price current_price unit status images',
                populate: {
                    path: 'farmer',
                    select: 'name phone'
                }
            });

        res.json({
            bids
        });
    } catch (error) {
        console.error('Get buyer bids error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

/**
 * Price Alert Controllers
 */

// Set a new price alert or update existing one for a crop
exports.setPriceAlert = async (req, res) => {
    try {
        const {
            crop_name,
            target_price
        } = req.body;
        const farmerId = req.user.id;

        let alert = await PriceAlert.findOne({
            farmer: farmerId,
            crop_name
        });

        if (alert) {
            alert.target_price = target_price;
            alert.is_active = true;
            await alert.save();
        } else {
            alert = await PriceAlert.create({
                farmer: farmerId,
                crop_name,
                target_price,
                is_active: true
            });
        }

        res.status(200).json({
            message: 'Price alert set successfully',
            alert
        });
    } catch (error) {
        console.error('Set price alert error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

// Get all price alerts for the current user
exports.getPriceAlerts = async (req, res) => {
    try {
        const farmerId = req.user.id;
        const alerts = await PriceAlert.find({
            farmer: farmerId
        }).sort({
            created_at: -1
        });

        res.status(200).json(alerts);
    } catch (error) {
        console.error('Get price alerts error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

// Toggle the active status of an alert
exports.togglePriceAlert = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const alert = await PriceAlert.findById(id);

        if (!alert) {
            return res.status(404).json({
                error: 'Alert not found'
            });
        }

        if (alert.farmer.toString() !== req.user.id) {
            return res.status(403).json({
                error: 'Not authorized'
            });
        }

        alert.is_active = !alert.is_active;
        await alert.save();

        res.status(200).json({
            message: 'Price alert toggled successfully',
            alert
        });
    } catch (error) {
        console.error('Toggle price alert error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};
exports.getBuyerBids = async (req, res) => {
    try {
        const buyerId = req.user.id;
        const bids = await Bid.find({
                buyer: buyerId
            })
            .sort({
                created_at: -1
            })
            .populate({
                path: 'crop',
                select: 'name min_price current_price unit status images',
                populate: {
                    path: 'farmer',
                    select: 'name phone'
                }
            });

        res.json({
            bids
        });
    } catch (error) {
        console.error('Get buyer bids error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

async function getSimilarCrops(crop) {
    return await Crop.find({
        name: crop.name,
        _id: {
            $ne: crop._id
        },
        status: 'listed'
    }).limit(5).sort({
        created_at: -1
    });
}

// Distance helper (Haversine Formula) in km
function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

/**
 * Compare Nearby Markets
 * Gets top 3 nearby markets for a specific crop, sorted by highest price.
 * Query Params: crop, lat, lng
 */
exports.compareNearbyMarkets = async (req, res) => {
    try {
        const {
            crop,
            lat,
            lng
        } = req.query;

        if (!crop || !lat || !lng) {
            return res.status(400).json({
                error: 'crop, lat, and lng are required query parameters.'
            });
        }

        const baseLat = parseFloat(lat);
        const baseLng = parseFloat(lng);

        // Find listed crops matching the name
        const crops = await Crop.find({
            name: {
                $regex: new RegExp(`^${crop}$`, 'i')
            },
            status: 'listed'
        }).populate('farmer', 'name location');

        const marketData = [];

        // In a real app, 'location' might have geoJSON. Based on current schema, we'll assume
        // 'location' might have coordinates, or we fallback to dummy coordinates if missing for demo.
        for (const c of crops) {
            let itemLat = baseLat + (Math.random() * 0.5 - 0.25); // fallback mock nearby
            let itemLng = baseLng + (Math.random() * 0.5 - 0.25); // fallback mock nearby

            // If the user appended geo-coords in 'location', we'd use them:
            if (c.location && c.location.lat && c.location.lng) {
                itemLat = parseFloat(c.location.lat);
                itemLng = parseFloat(c.location.lng);
            }

            const distance = calculateDistance(baseLat, baseLng, itemLat, itemLng);

            let marketName = (c.location && c.location.district) || (c.location && c.location.state) || "Local Market";

            marketData.push({
                market_name: marketName,
                price: c.current_price || c.min_price,
                distance: parseFloat(distance.toFixed(1)),
                unit: c.unit || 'kg'
            });
        }

        // Sort by highest price descending
        marketData.sort((a, b) => b.price - a.price);

        // Return Top 3
        const top3 = marketData.slice(0, 3);

        res.json({
            crop,
            base_location: {
                lat: baseLat,
                lng: baseLng
            },
            nearby_markets: top3
        });

    } catch (error) {
        console.error('Compare nearby markets error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};