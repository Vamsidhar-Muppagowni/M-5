const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    crop_name: {
        type: String,
        required: true,
        trim: true
    },
    target_price: {
        type: Number,
        required: true,
        min: 0
    },
    is_active: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

priceAlertSchema.index({
    farmer: 1,
    crop_name: 1
});

const PriceAlert = mongoose.model('PriceAlert', priceAlertSchema);

module.exports = PriceAlert;