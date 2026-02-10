const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'success', 'warning', 'error', 'bid', 'order', 'scheme'],
        default: 'info'
    },
    action_link: String,
    metadata: {
        type: Map,
        of: String
    },
    is_read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

NotificationSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

module.exports = mongoose.model('Notification', NotificationSchema);
