const mongoose = require('mongoose');

const PriceHistorySchema = new mongoose.Schema({
    crop_name: {
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
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('PriceHistory', PriceHistorySchema);
