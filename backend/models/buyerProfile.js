const mongoose = require('mongoose');

const BuyerProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    company_name: {
        type: String,
        trim: true
    },
    gst_number: {
        type: String,
        trim: true
    },
    license_number: {
        type: String,
        trim: true
    },
    business_type: {
        type: String, // e.g., 'Retailer', 'Wholesaler', 'Exporter'
        trim: true
    },
    preferred_crops: {
        type: [String],
        default: []
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    rating_count: {
        type: Number,
        default: 0
    },
    verification_status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

BuyerProfileSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

module.exports = mongoose.model('BuyerProfile', BuyerProfileSchema);
