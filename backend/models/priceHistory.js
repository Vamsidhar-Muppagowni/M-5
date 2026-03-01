const mongoose = require('mongoose');

/**
 * Price History Model
 * 
 * Stores historical price data for crops to enable:
 * - Price trend analysis (charts)
 * - ML model training
 * - Future price predictions
 */
const PriceHistorySchema = new mongoose.Schema({
    cropName: {
        type: String,
        required: true,
        index: true
    },
    market_name: String,
    price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    },
    quality: String,
    region: String
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});

module.exports = mongoose.model('PriceHistory', PriceHistorySchema);