const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    reported_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: false
    },
    reason: {
        type: String,
        required: [true, 'Issue reason is required'],
        enum: ['Fraud', 'Quality Difference', 'Payment Issue', 'Delivery Delay', 'Platform Error', 'Other']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    status: {
        type: String,
        enum: ['pending', 'investigating', 'resolved', 'closed'],
        default: 'pending',
        index: true
    },
    resolution_notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

IssueSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

module.exports = mongoose.model('Issue', IssueSchema);
