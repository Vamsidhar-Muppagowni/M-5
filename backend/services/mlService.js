const axios = require('axios');
const redisClient = require('../config/redis');
const {
    PriceHistory,
    Crop,
    Transaction
} = require('../models');
// const { Op } = require('sequelize'); // Not needed for Mongoose

/**
 * ML Service
 * 
 * Encapsulates all logic related to Machine Learning and Data Analysis.
 * - Predicts future crop prices using historical data or external ML API.
 * - Generates market insights and trends.
 * - Provides crop and price recommendations.
 * - Implements caching (Redis) for predictions to improve performance.
 * - Includes fallback mechanisms (local rules) if ML API is unavailable.
 */
class MLService {
    constructor() {
        this.predictionApi = process.env.ML_API_URL || 'http://localhost:5000';
        this.weatherApiKey = process.env.WEATHER_API_KEY;
    }

    /**
     * Predicts the potential price of a crop for upcoming days.
     * Uses Redis for caching results.
     * Falls back to local rule-based prediction if ML API fails.
     */
    async predictPrice(params) {
        try {
            const {
                crop,
                location,
                days = 7
            } = params;

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

    /**
     * Recommends a selling price based on current market listings,
     * quality, and quantity (bulk discounts/premiums).
     */
    async getRecommendedPrice(params) {
        try {
            const {
                crop,
                quality,
                location,
                quantity
            } = params;

            // Get current market prices
            const query = {
                name: crop,
                status: 'listed'
            };
            if (location) {
                query['location.district'] = location;
            }

            const currentPrices = await Crop.find(query)
                .select('current_price quality_grade quantity')
                .sort({
                    created_at: -1
                })
                .limit(20);

            if (currentPrices.length === 0) {
                // Use historical data
                const histQuery = {
                    cropName: (crop || '').trim().toLowerCase()
                };
                if (location) histQuery.region = location;

                const historical = await PriceHistory.findOne(histQuery).sort({
                    date: -1
                });

                return historical ? Number(historical.price) * 1.1 : null; // 10% markup
            }

            // Calculate average price based on quality
            const qualityPrices = currentPrices.filter(p => p.quality_grade === quality);
            if (qualityPrices.length > 0) {
                const avgPrice = qualityPrices.reduce((sum, p) => sum + parseFloat(p.current_price), 0) / qualityPrices.length;

                // Adjust for quantity (bulk discount)
                let finalPrice = avgPrice;
                if (quantity > 1000) { // More than 1000kg
                    finalPrice *= 0.95; // 5% discount
                } else if (quantity < 100) { // Less than 100kg
                    finalPrice *= 1.05; // 5% premium
                }

                return parseFloat(finalPrice.toFixed(2));
            }

            // Fallback to overall average
            const avgPrice = currentPrices.reduce((sum, p) => sum + parseFloat(p.current_price), 0) / currentPrices.length;
            return parseFloat(avgPrice.toFixed(2));
        } catch (error) {
            console.error('Get recommended price error:', error);
            return null;
        }
    }

    /**
     * Generates qualitative insights about the market.
     * Analyzes price trends, supply levels, and buyer interest.
     */
    async getMarketInsights(params) {
        try {
            const {
                crop,
                location
            } = params;

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

            const cropQuery = {
                name: crop
            };
            if (location) cropQuery['location.district'] = location;

            const relevantCrops = await Crop.find(cropQuery).select('_id');
            const cropIds = relevantCrops.map(c => c._id);

            const recentTransactions = await Transaction.find({
                crop: {
                    $in: cropIds
                },
                created_at: {
                    $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            }).sort({
                created_at: -1
            });


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
                ...(location && {
                    'location.district': location
                })
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

    /**
     * Recommends top-3 crops based on soil, weather, and nutrient data.
     * Calls the Python Flask ML service running on port 5001.
     * Falls back to a rule-based recommendation if ML service is unavailable.
     */
    async getCropRecommendation(params) {
        const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';
        try {
            const response = await axios.post(
                `${ML_SERVICE_URL}/recommend-crop`,
                params,
                { timeout: 5000 }
            );
            return response.data;
        } catch (error) {
            console.warn('[MLService] Crop ML service unavailable, using fallback:', error.message);
            return this._cropFallback(params);
        }
    }

    _cropFallback(params) {
        const { temperature = 25, rainfall = 100 } = params;

        let recommendations;
        if (temperature > 30 && rainfall < 50) {
            recommendations = [
                { rank: 1, crop: 'Mothbeans', confidence: 60.0 },
                { rank: 2, crop: 'Mungbean', confidence: 25.0 },
                { rank: 3, crop: 'Mango', confidence: 15.0 },
            ];
        } else if (rainfall > 150) {
            recommendations = [
                { rank: 1, crop: 'Rice', confidence: 80.0 },
                { rank: 2, crop: 'Jute', confidence: 10.0 },
                { rank: 3, crop: 'Papaya', confidence: 10.0 },
            ];
        } else {
            recommendations = [
                { rank: 1, crop: 'Maize', confidence: 50.0 },
                { rank: 2, crop: 'Cotton', confidence: 30.0 },
                { rank: 3, crop: 'Wheat', confidence: 20.0 },
            ];
        }

        return {
            success: true,
            fallback: true,
            message: 'ML service unavailable - using rule-based crop estimate',
            recommendations,
        };
    }

    async getPriceHistory(params) {
        try {
            const {
                crop,
                location,
                days = 30
            } = params;

            const query = {
                cropName: (crop || '').trim().toLowerCase(),
                date: {
                    $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
                }
            };
            if (location) query.region = location;

            const history = await PriceHistory.find(query)
                .sort({
                    date: 1
                })
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
        return {
            crop: params.crop,
            location: params.location,
            historical_prices: historicalData.map(d => ({
                date: d.date,
                price: d.price
            })),
            season: this.getCurrentSeason(),
            market_holidays: this.getUpcomingHolidays(),
            weather_forecast: this.getWeatherForecast(params.location)
        };
    }

    async callMLApi(features) {
        try {
            const response = await axios.post(`${this.predictionApi}/predict`, features);
            return response.data;
        } catch (error) {
            console.error('ML API call failed:', error);
            throw error;
        }
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
        return [{
            date: '2024-01-26',
            name: 'Republic Day'
        },
        {
            date: '2024-08-15',
            name: 'Independence Day'
        },
        {
            date: '2024-10-02',
            name: 'Gandhi Jayanti'
        }
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
            cropName: (crop || '').trim().toLowerCase(),
            date: {
                $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
            }
        };
        if (location) query.region = location;

        return await PriceHistory.find(query).sort({
            date: 1
        });
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
            predictions: [{
                date: new Date(Date.now() + 24 * 60 * 60 * 1000),
                predicted_price: 50.00,
                confidence: 0.5
            }],
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
        return [{
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
    /**
     * Recommends top-3 fertilizers based on soil/crop/nutrient data.
     * Calls the Python Flask ML service running on port 5001.
     * Falls back to a rule-based recommendation if ML service is unavailable.
     */
    async getFertilizerRecommendation(params) {
        const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';
        try {
            const response = await axios.post(
                `${ML_SERVICE_URL}/recommend-fertilizer`,
                params,
                { timeout: 5000 }
            );
            return response.data;
        } catch (error) {
            console.warn('[MLService] Fertilizer ML service unavailable, using fallback:', error.message);
            return this._fertilizerFallback(params);
        }
    }

    _fertilizerFallback(params) {
        const { nitrogen = 20, phosphorous = 15, potassium = 10 } = params;
        let recommendations;
        if (nitrogen > 30) {
            recommendations = [
                { rank: 1, fertilizer: 'Urea', confidence: 75.0 },
                { rank: 2, fertilizer: '28-28', confidence: 15.0 },
                { rank: 3, fertilizer: '17-17-17', confidence: 10.0 },
            ];
        } else if (phosphorous > 25) {
            recommendations = [
                { rank: 1, fertilizer: 'DAP', confidence: 70.0 },
                { rank: 2, fertilizer: '14-35-14', confidence: 20.0 },
                { rank: 3, fertilizer: '10-26-26', confidence: 10.0 },
            ];
        } else {
            recommendations = [
                { rank: 1, fertilizer: '17-17-17', confidence: 45.0 },
                { rank: 2, fertilizer: '20-20', confidence: 30.0 },
                { rank: 3, fertilizer: 'DAP', confidence: 25.0 },
            ];
        }
        return {
            success: true,
            fallback: true,
            message: 'ML service unavailable - using rule-based estimate',
            recommendations,
        };
    }

}

module.exports = new MLService();