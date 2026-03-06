const mongoose = require('mongoose');

const FarmerProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    farm_size: {
        type: Number, // in acres
        default: 0
    },
    major_crops: {
        type: [String],
        default: []
    },
    soil_type: {
        type: String,
        trim: true
    },
    irrigation_type: {
        type: String,
        trim: true
    },
    experience_years: {
        type: Number,
        default: 0
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
    },
    payment_methods: {
        upi_id: { type: String, trim: true },
        qr_code_image_url: { type: String },
        bank_account: {
            account_number: { type: String, trim: true },
            ifsc_code: { type: String, trim: true },
            bank_name: { type: String, trim: true },
            account_holder_name: { type: String, trim: true }
        }
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

FarmerProfileSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

module.exports = mongoose.model('FarmerProfile', FarmerProfileSchema);
