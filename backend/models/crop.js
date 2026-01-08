const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Crop name is required'],
        trim: true,
        index: true
    },
    variety: {
        type: String,
        trim: true
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: 0
    },
    unit: {
        type: String,
        default: 'kg',
        enum: ['kg', 'quintal', 'ton']
    },
    quality_grade: {
        type: String,
        enum: ['A', 'B', 'C', 'D'],
        default: 'B'
    },
    min_price: {
        type: Number,
        required: [true, 'Minimum price is required'],
        min: 0
    },
    current_price: {
        type: Number,
        required: [true, 'Current price is required'],
        min: 0
    },
    description: String,
    location: {
        district: String,
        address_line1: String,
        city: String,
        state: String,
        pincode: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    images: {
        type: [String],
        default: []
    },
    harvest_date: Date,
    expiry_date: Date,
    status: {
        type: String,
        enum: ['draft', 'listed', 'reserved', 'sold', 'expired'],
        default: 'draft',
        index: true
    },
    bid_end_date: Date,
    view_count: {
        type: Number,
        default: 0
    },
    bid_count: {
        type: Number,
        default: 0
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for common queries
CropSchema.index({ name: 'text', description: 'text', variety: 'text' });
// CropSchema.index({ status: 1 }); // Already indexed in schema definition
CropSchema.index({ farmer: 1 });

CropSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

module.exports = mongoose.model('Crop', CropSchema);
