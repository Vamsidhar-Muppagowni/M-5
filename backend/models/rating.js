const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
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
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        trim: true,
        maxlength: 500
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Ensure a buyer can only rate a farmer once
RatingSchema.index({ buyer: 1, farmer: 1 }, { unique: true });

// Virtual for 'id'
RatingSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Update farmer's average rating when a rating is saved
RatingSchema.post('save', async function () {
    const FarmerProfile = mongoose.model('FarmerProfile');
    const Rating = mongoose.model('Rating');

    const stats = await Rating.aggregate([
        { $match: { farmer: this.farmer } },
        {
            $group: {
                _id: '$farmer',
                avgRating: { $avg: '$rating' },
                count: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await FarmerProfile.findOneAndUpdate(
            { user: this.farmer },
            {
                rating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal
                rating_count: stats[0].count
            }
        );
    }
});

// Update farmer's average rating when a rating is deleted
RatingSchema.post('remove', async function () {
    const FarmerProfile = mongoose.model('FarmerProfile');
    const Rating = mongoose.model('Rating');

    const stats = await Rating.aggregate([
        { $match: { farmer: this.farmer } },
        {
            $group: {
                _id: '$farmer',
                avgRating: { $avg: '$rating' },
                count: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await FarmerProfile.findOneAndUpdate(
            { user: this.farmer },
            {
                rating: Math.round(stats[0].avgRating * 10) / 10,
                rating_count: stats[0].count
            }
        );
    } else {
        // No ratings left, reset to 0
        await FarmerProfile.findOneAndUpdate(
            { user: this.farmer },
            {
                rating: 0,
                rating_count: 0
            }
        );
    }
});

module.exports = mongoose.model('Rating', RatingSchema);
