const redisClient = require('../config/redis');

const calculateTrendPercentage = (priceHistory) => {
    if (!priceHistory || priceHistory.length < 2) return 0;

    // Assumes priceHistory is chronological or we sort it to be sure
    const sortedHistory = [...priceHistory].sort((a, b) => new Date(a.date) - new Date(b.date));

    const oldestPrice = sortedHistory[0].price;
    const latestPrice = sortedHistory[sortedHistory.length - 1].price;

    if (oldestPrice === 0) return 0;

    return ((latestPrice - oldestPrice) / oldestPrice) * 100;
};

const determineTrendLabel = (trendPercentage) => {
    if (trendPercentage > 1) return 'increasing';
    if (trendPercentage < -1) return 'decreasing';
    return 'stable';
};

const calculateVolatility = (priceHistory) => {
    if (!priceHistory || priceHistory.length < 2) return 'Stable Market';

    const prices = priceHistory.map(p => p.price);
    const mean = prices.reduce((acc, p) => acc + p, 0) / prices.length;

    const variance = prices.reduce((acc, p) => acc + Math.pow(p - mean, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);

    // Threshold for volatility (e.g., 5% of mean)
    if (stdDev > mean * 0.05) {
        return 'High Volatility';
    }

    return 'Stable Market';
};

const calculateConfidence = (priceHistory, volatility) => {
    if (!priceHistory || priceHistory.length === 0) return 60;

    let baseConfidence = 90;

    // Penalty for missing data (e.g. fewer than 6 records points to incomplete 6-month historical data)
    if (priceHistory.length < 6) {
        baseConfidence -= (6 - priceHistory.length) * 5;
    }

    // Penalty for high volatility
    if (volatility === 'High Volatility') {
        baseConfidence -= 15;
    }

    if (baseConfidence > 100) return 100;
    if (baseConfidence < 60) return 60;

    return baseConfidence;
};

const calculateMomentum = (priceHistory) => {
    if (!priceHistory || priceHistory.length < 2) return {
        value: 0,
        label: 'Neutral'
    };

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(now.getDate() - 60);

    const lastMonthPrices = priceHistory.filter(p => new Date(p.date) >= thirtyDaysAgo);
    const prevMonthPrices = priceHistory.filter(p => new Date(p.date) >= sixtyDaysAgo && new Date(p.date) < thirtyDaysAgo);

    let lastAvg = 0;
    const sorted = [...priceHistory].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (lastMonthPrices.length > 0) {
        lastAvg = lastMonthPrices.reduce((acc, p) => acc + p.price, 0) / lastMonthPrices.length;
    } else {
        lastAvg = sorted[0].price;
    }

    let prevAvg = 0;
    if (prevMonthPrices.length > 0) {
        prevAvg = prevMonthPrices.reduce((acc, p) => acc + p.price, 0) / prevMonthPrices.length;
    } else {
        prevAvg = sorted.length > 1 ? sorted[1].price : lastAvg;
    }

    let change = 0;
    if (prevAvg > 0) {
        change = ((lastAvg - prevAvg) / prevAvg) * 100;
    }

    let label = 'Neutral';
    if (change > 5) label = 'Strong Upward Pressure';
    else if (change < -5) label = 'Sharp Drop Risk';

    return {
        value: parseFloat(change.toFixed(2)),
        label
    };
};

const getCachedAnalysis = async (cropId) => {
    try {
        const cacheKey = `price_analysis_${cropId}`;
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        return null;
    } catch (error) {
        console.error('Redis get error:', error);
        return null;
    }
};

const setCachedAnalysis = async (cropId, data) => {
    try {
        const cacheKey = `price_analysis_${cropId}`;
        await redisClient.setEx(cacheKey, 600, JSON.stringify(data)); // TTL 10 minutes
    } catch (error) {
        console.error('Redis set error:', error);
    }
};

module.exports = {
    calculateTrendPercentage,
    determineTrendLabel,
    calculateVolatility,
    calculateConfidence,
    calculateMomentum,
    getCachedAnalysis,
    setCachedAnalysis
};