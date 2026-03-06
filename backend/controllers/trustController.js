const { Issue, Review, FarmerProfile, BuyerProfile, User, Transaction } = require('../models');

exports.reportIssue = async (req, res) => {
    try {
        const { reported_user, transaction, reason, description } = req.body;

        const newIssue = await Issue.create({
            reporter: req.user.id,
            reported_user: reported_user || null,
            transaction: transaction || null,
            reason,
            description
        });

        res.status(201).json({
            message: 'Issue reported successfully',
            issue: newIssue
        });
    } catch (error) {
        console.error('Report issue error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

exports.submitReview = async (req, res) => {
    try {
        const { reviewee, rating, comment } = req.body;
        const reviewer = req.user.id;

        // Check if reviewing self
        if (reviewer === reviewee) {
            return res.status(400).json({ error: 'You cannot review yourself.' });
        }

        // Find strictly a completed transaction between these two users
        const tx = await Transaction.findOne({
            $or: [
                { buyer: reviewer, farmer: reviewee },
                { buyer: reviewee, farmer: reviewer }
            ]
        }).sort({ created_at: -1 });

        if (!tx) {
            return res.status(403).json({ error: 'You can only review users you have traded with.' });
        }

        // Create the review
        const newReview = await Review.create({
            reviewer,
            reviewee,
            transaction: tx._id,
            rating,
            comment
        });

        // Update target user's profile rating
        const targetUser = await User.findById(reviewee);
        if (!targetUser) return res.status(404).json({ error: 'Reviewee not found' });

        let profile;
        if (targetUser.user_type === 'farmer') {
            profile = await FarmerProfile.findOne({ user: reviewee });
        } else if (targetUser.user_type === 'buyer') {
            profile = await BuyerProfile.findOne({ user: reviewee });
        }

        if (profile) {
            const currentRatingCount = profile.rating_count || 0;
            const currentAvg = profile.rating || 0;

            // Calculate new average
            const newAvg = ((currentAvg * currentRatingCount) + rating) / (currentRatingCount + 1);

            profile.rating = Number(newAvg.toFixed(1));
            profile.rating_count = currentRatingCount + 1;

            await profile.save();
        }

        res.status(201).json({
            message: 'Review submitted successfully',
            review: newReview
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'You have already reviewed this transaction.' });
        }
        console.error('Submit review error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

exports.getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params;
        const reviews = await Review.find({ reviewee: userId })
            .populate('reviewer', 'name phone')
            .sort('-created_at');

        res.json({
            success: true,
            reviews
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await Transaction.find({
            $or: [{ buyer: userId }, { farmer: userId }]
        })
            .populate('crop', 'name variety quality_grade')
            .populate('buyer', 'name phone location')
            .populate('farmer', 'name phone location')
            .sort({ created_at: -1 });

        res.json({ transactions });
    } catch (error) {
        console.error('Get transaction history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
