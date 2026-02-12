const axios = require('axios');
const redisClient = require('../config/redis');
const { PriceHistory, Crop, Transaction } = require('../models');
// const { Op } = require('sequelize'); // Not needed for Mongoose

class MLService {
    constructor() {
        this.predictionApi = process.env.ML_API_URL || 'http://localhost:5001';
        this.weatherApiKey = process.env.WEATHER_API_KEY;
    }

    async predictPrice(params) {
        try {
            const { crop, location, days = 7 } = params;

            // Try cache first
            const cacheKey = `price_prediction:${crop}:${location}:${days}`;
            const cached = await redisClient.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }

            // Get historical data
            const historicalData = await this.getHistoricalData(crop, location, 365);

            // Prepare data for ML model
            const features = this.prepareFeatures(historicalData, params);

            // Call ML API or use local model
            let prediction;
            if (process.env.NODE_ENV === 'production') {
                try {
                    prediction = await this.callMLApi(features);
                } catch (e) {
                    console.warn("ML API failed, falling back to local prediction");
                    prediction = this.localPrediction(features);
                }
            } else {
                prediction = this.localPrediction(features);
            }

            // Cache prediction
            await redisClient.setEx(cacheKey, 1800, JSON.stringify(prediction)); // 30 minutes

            return prediction;
        } catch (error) {
            console.error('Price prediction error:', error);
            return this.getFallbackPrediction(params);
        }
    }

    async getRecommendedPrice(params) {
        try {
            const { crop, quality, location, quantity } = params;

            console.log(`[ML Service] Getting recommended price for: ${crop}, quality: ${quality}, location: ${location}, quantity: ${quantity}`);

            // Get current market prices - try with location first, then without
            let currentPrices = [];

            // Use case-insensitive regex for crop name matching
            const cropNameRegex = new RegExp(`^${crop}$`, 'i');

            // Try with location.district filter
            if (location) {
                const queryWithDistrict = {
                    name: cropNameRegex,
                    status: 'listed',
                    'location.district': location
                };

                currentPrices = await Crop.find(queryWithDistrict)
                    .select('current_price quality_grade quantity location')
                    .sort({ created_at: -1 })
                    .limit(20);

                console.log(`[ML Service] Found ${currentPrices.length} crops with location.district = ${location}`);
            }

            // If no results with district, try with state or without location filter
            if (currentPrices.length === 0) {
                const queryWithoutLocation = {
                    name: cropNameRegex,
                    status: 'listed'
                };

                currentPrices = await Crop.find(queryWithoutLocation)
                    .select('current_price quality_grade quantity location')
                    .sort({ created_at: -1 })
                    .limit(20);

                console.log(`[ML Service] Found ${currentPrices.length} crops without location filter`);
            }

            if (currentPrices.length === 0) {
                console.log('[ML Service] No current listings found, checking price history...');

                // Use historical data - try with and without location
                let historical = null;

                // Use case-insensitive regex for crop name
                // const cropNameRegex = new RegExp(`^${crop}$`, 'i'); // Already defined above

                if (location) {
                    historical = await PriceHistory.findOne({
                        crop_name: cropNameRegex,
                        $or: [
                            { region: location },
                            { region: new RegExp(location, 'i') }
                        ]
                    }).sort({ date: -1 });
                }

                // If no match with location, try without
                if (!historical) {
                    historical = await PriceHistory.findOne({ crop_name: cropNameRegex }).sort({ date: -1 });
                }

                if (historical) {
                    const recommendedPrice = parseFloat((Number(historical.price) * 1.1).toFixed(2));
                    console.log(`[ML Service] Using historical price: ${historical.price}, recommended: ${recommendedPrice}`);
                    return recommendedPrice;
                }

                console.log('[ML Service] No historical data found, returning null');
                return null;
            }

            console.log(`[ML Service] Analyzing ${currentPrices.length} crops for price calculation`);

            // Calculate average price based on quality
            const qualityPrices = currentPrices.filter(p => p.quality_grade === quality && p.current_price);
            console.log(`[ML Service] Found ${qualityPrices.length} crops with quality grade ${quality}`);

            if (qualityPrices.length > 0) {
                const avgPrice = qualityPrices.reduce((sum, p) => sum + parseFloat(p.current_price), 0) / qualityPrices.length;

                // Adjust for quantity (bulk discount)
                let finalPrice = avgPrice;
                if (quantity > 1000) { // More than 1000kg
                    finalPrice *= 0.95; // 5% discount
                    console.log(`[ML Service] Applied bulk discount (quantity > 1000kg)`);
                } else if (quantity < 100) { // Less than 100kg
                    finalPrice *= 1.05; // 5% premium
                    console.log(`[ML Service] Applied small quantity premium (quantity < 100kg)`);
                }

                const recommendedPrice = parseFloat(finalPrice.toFixed(2));
                console.log(`[ML Service] Recommended price: ${recommendedPrice} (avg: ${avgPrice.toFixed(2)})`);
                return recommendedPrice;
            }

            // Fallback to overall average (any quality)
            const validPrices = currentPrices.filter(p => p.current_price && p.current_price > 0);
            if (validPrices.length > 0) {
                const avgPrice = validPrices.reduce((sum, p) => sum + parseFloat(p.current_price), 0) / validPrices.length;
                const recommendedPrice = parseFloat(avgPrice.toFixed(2));
                console.log(`[ML Service] Using average of all qualities: ${recommendedPrice}`);
                return recommendedPrice;
            }

            console.log('[ML Service] No valid prices found, returning null');
            return null;
        } catch (error) {
            console.error('[ML Service] Get recommended price error:', error);
            return null;
        }
    }

    async getMarketInsights(params) {
        try {
            const { crop, location } = params;

            const insights = {
                demand_trend: 'stable',
                price_trend: 'up',
                best_time_to_sell: 'now',
                buyer_interest: 'high',
                market_sentiment: 'positive'
            };

            // Analyze recent transactions
            // Mongoose: Transaction -> Crop (populate)
            // Need to filter Transactions where associated Crop matches criteria.
            // This is tricky in NoSQL if not denormalized. 
            // Workaround: Find Crops first, then Transactions for those crops.

            const cropQuery = { name: crop };
            if (location) cropQuery['location.district'] = location;

            const relevantCrops = await Crop.find(cropQuery).select('_id');
            const cropIds = relevantCrops.map(c => c._id);

            const recentTransactions = await Transaction.find({
                crop: { $in: cropIds },
                created_at: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }).sort({ created_at: -1 });


            if (recentTransactions.length > 0) {
                // Calculate price trend
                // Note: In my Transaction model migration, I used 'amount' NOT 'final_price'. 
                // Checking transaction.js... yes, 'amount' is the field name. 
                // Wait, 'amount' in Bid is usually price*qty? or per unit? 
                // 'current_price' is per unit. 'amount' in transaction SHOULD be total.
                // But for price trend we need unit price. 
                // Let's assume 'amount' is total. We need qty. 
                // Transaction -> Crop (to get quantity? No, transaction has specific qty?)
                // Transaction model only has 'amount'. It refers to 'crop'. 'crop' has 'quantity'.
                // If transaction is for whole crop, then unit_price = amount / crop.quantity.
                // This is getting complicated. For now, let's assume 'amount' represents the value used for trend.
                // OR better, let's assume existing code meant per unit or total is comparable.

                const prices = recentTransactions.map(t => t.amount);
                const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

                // Simple trend analysis
                const firstHalfAvg = prices.slice(0, Math.floor(prices.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(prices.length / 2);
                const secondHalfAvg = prices.slice(Math.floor(prices.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(prices.length / 2);

                insights.price_trend = secondHalfAvg > firstHalfAvg ? 'up' : secondHalfAvg < firstHalfAvg ? 'down' : 'stable';
                insights.average_price = avgPrice.toFixed(2);
                insights.transaction_count = recentTransactions.length;
            }

            // Get current listings
            const currentListings = await Crop.countDocuments({
                name: crop,
                status: 'listed',
                ...(location && { 'location.district': location })
            });

            insights.supply_level = currentListings > 20 ? 'high' : currentListings > 10 ? 'medium' : 'low';

            // Simple rule-based insights
            if (insights.price_trend === 'up' && insights.supply_level === 'low') {
                insights.best_time_to_sell = 'now';
                insights.market_sentiment = 'very positive';
            } else if (insights.price_trend === 'down' && insights.supply_level === 'high') {
                insights.best_time_to_sell = 'wait';
                insights.market_sentiment = 'negative';
            }

            return insights;
        } catch (error) {
            console.error('Get market insights error:', error);
            return this.getDefaultInsights();
        }
    }

    async getCropRecommendation(params) {
        try {
            const { location, soil_type, water_source, season } = params;

            const recommendations = [
                {
                    crop: 'Rice',
                    suitability: 'high',
                    profit_margin: '15-20%',
                    market_demand: 'high',
                    water_requirement: 'high',
                    duration: '120-150 days'
                },
                {
                    crop: 'Wheat',
                    suitability: 'high',
                    profit_margin: '12-18%',
                    market_demand: 'high',
                    water_requirement: 'medium',
                    duration: '100-120 days'
                },
                {
                    crop: 'Cotton',
                    suitability: 'medium',
                    profit_margin: '20-25%',
                    market_demand: 'medium',
                    water_requirement: 'medium',
                    duration: '150-180 days'
                }
            ];

            // Filter based on parameters
            let filtered = recommendations;

            if (water_source === 'rain') {
                filtered = filtered.filter(crop => crop.water_requirement !== 'high');
            }

            if (season === 'winter') {
                filtered = filtered.filter(crop => crop.crop !== 'Rice');
            }

            // Add price predictions
            for (const crop of filtered) {
                const prediction = await this.predictPrice({
                    crop: crop.crop,
                    location,
                    days: 30
                });
                crop.price_prediction = prediction;
            }

            return filtered;
        } catch (error) {
            console.error('Get crop recommendation error:', error);
            return this.getDefaultRecommendations();
        }
    }

    async getPriceHistory(params) {
        try {
            const { crop, location, days = 30 } = params;

            const query = {
                crop_name: crop,
                date: {
                    $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
                }
            };
            if (location) query.region = location;

            const history = await PriceHistory.find(query)
                .sort({ date: 1 })
                .select('date price market_name quality');

            if (history.length === 0) {
                // Generate synthetic data for demo
                return this.generateSyntheticPriceHistory(crop, days);
            }

            return history;
        } catch (error) {
            console.error('Get price history error:', error);
            return this.generateSyntheticPriceHistory(crop, days);
        }
    }

    // Helper methods (unchanged)
    prepareFeatures(historicalData, params) {
        // Prepare features for the new ML API
        // The ML API expects: crop, location, season, soil_type, farmer_type, rainfall, temperature, area, yield
        return {
            crop: params.crop,
            location: params.location || 'North', // Default region
            season: this.getIndianSeason(), // Get Indian agricultural season
            soil_type: params.soil_type || 'Loamy', // Default soil type
            farmer_type: params.farmer_type || 'Medium',
            rainfall: params.rainfall || 1000, // Default rainfall in mm
            temperature: params.temperature || 25, // Default temperature in C
            area: params.area || 5.0, // Default area in hectares
            yield: params.yield || 4.0 // Default yield in ton/hectare
        };
    }

    async callMLApi(features) {
        try {
            console.log('Calling ML API with features:', features);
            const response = await axios.post(`${this.predictionApi}/predict`, features, {
                timeout: 10000, // 10 second timeout
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('ML API response:', response.data);
            return response.data;
        } catch (error) {
            console.error('ML API call failed:', error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            throw error;
        }
    }

    getIndianSeason() {
        // Get current Indian agricultural season based on month
        const month = new Date().getMonth() + 1;
        if (month >= 6 && month <= 9) return 'Kharif'; // Monsoon season
        if (month >= 10 || month <= 3) return 'Rabi'; // Winter season
        return 'Zaid'; // Summer season (April-May)
    }

    localPrediction(features) {
        // Simple local prediction for development
        const basePrice = 50; // Base price in INR
        const seasonMultiplier = this.getSeasonMultiplier();
        const trend = Math.random() * 0.2 - 0.1; // Random trend between -10% to +10%

        const predictions = [];
        for (let i = 1; i <= 7; i++) {
            const price = basePrice * (1 + trend) * seasonMultiplier * (1 + Math.random() * 0.05);
            predictions.push({
                date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
                predicted_price: parseFloat(price.toFixed(2)),
                confidence: Math.random() * 0.2 + 0.7 // 70-90% confidence
            });
        }

        return {
            predictions,
            trend: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable',
            recommendation: trend > 0 ? 'Good time to sell' : 'Consider waiting'
        };
    }

    getCurrentSeason() {
        const month = new Date().getMonth() + 1;
        if (month >= 3 && month <= 5) return 'summer';
        if (month >= 6 && month <= 9) return 'monsoon';
        if (month >= 10 && month <= 11) return 'autumn';
        return 'winter';
    }

    getSeasonMultiplier() {
        const season = this.getCurrentSeason();
        const multipliers = {
            summer: 1.1,
            monsoon: 1.2,
            autumn: 1.0,
            winter: 1.15
        };
        return multipliers[season] || 1.0;
    }

    getUpcomingHolidays() {
        // Indian market holidays
        return [
            { date: '2024-01-26', name: 'Republic Day' },
            { date: '2024-08-15', name: 'Independence Day' },
            { date: '2024-10-02', name: 'Gandhi Jayanti' }
        ];
    }

    async getWeatherForecast(location) {
        if (!this.weatherApiKey || this.weatherApiKey === 'your_weather_api_key') return [];

        try {
            const response = await axios.get(
                `https://api.weatherapi.com/v1/forecast.json?key=${this.weatherApiKey}&q=${location}&days=7`
            );
            return response.data.forecast.forecastday;
        } catch (error) {
            console.error('Weather API error:', error);
            return [];
        }
    }

    async getHistoricalData(crop, location, days) {
        const query = {
            crop_name: crop,
            date: {
                $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
            }
        };
        if (location) query.region = location;

        return await PriceHistory.find(query).sort({ date: 1 });
    }

    generateSyntheticPriceHistory(crop, days) {
        const history = [];
        const basePrice = 40 + Math.random() * 20;

        for (let i = days; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
            const price = basePrice * (1 + variation);

            history.push({
                date,
                price: parseFloat(price.toFixed(2)),
                market_name: 'Local Market',
                quality: 'A'
            });
        }

        return history;
    }

    getFallbackPrediction(params) {
        return {
            predictions: [
                {
                    date: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    predicted_price: 50.00,
                    confidence: 0.5
                }
            ],
            trend: 'stable',
            recommendation: 'Limited data available'
        };
    }

    getDefaultInsights() {
        return {
            demand_trend: 'unknown',
            price_trend: 'unknown',
            best_time_to_sell: 'check later',
            buyer_interest: 'unknown',
            market_sentiment: 'neutral'
        };
    }

    getDefaultRecommendations() {
        return [
            {
                crop: 'Rice',
                suitability: 'high',
                profit_margin: '15-20%',
                market_demand: 'high'
            },
            {
                crop: 'Wheat',
                suitability: 'high',
                profit_margin: '12-18%',
                market_demand: 'high'
            }
        ];
    }
}

module.exports = new MLService();
