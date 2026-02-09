const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    bid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bid',
        required: true,
        unique: true
    },
    crop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crop',
        required: true
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    payment_status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    payment_method: {
        type: String,
        enum: ['cash', 'upi', 'bank_transfer', 'card'],
        default: 'cash'
    },
    transaction_id: {
        type: String, // from payment gateway
        sparse: true
    },
    delivery_status: {
        type: String,
        enum: ['pending', 'scheduled', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

TransactionSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

module.exports = mongoose.model('Transaction', TransactionSchema);
