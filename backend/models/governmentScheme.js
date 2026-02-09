const mongoose = require('mongoose');

const GovernmentSchemeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    benefits: String,
    eligibility_criteria: String,
    application_link: String,
    deadline: Date,
    status: {
        type: String,
        enum: ['active', 'expired', 'upcoming'],
        default: 'active'
    },
    state: String, // Applicable state or 'Central'
    category: String // e.g., 'Loan', 'Subsidy', 'Insurance'
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('GovernmentScheme', GovernmentSchemeSchema);
