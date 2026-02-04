const { GovernmentScheme } = require('../models');

exports.getSchemes = async (req, res) => {
    try {
        const schemes = await GovernmentScheme.findAll();
        // Return dummy data if empty for demo
        if (schemes.length === 0) {
            return res.json([
                {
                    id: '1',
                    name: 'PM-KISAN',
                    description: 'Pradhan Mantri Kisan Samman Nidhi',
                    benefits: '₹6000 per year',
                    application_link: 'https://pmkisan.gov.in'
                },
                {
                    id: '2',
                    name: 'KCC',
                    description: 'Kisan Credit Card Scheme',
                    benefits: 'Low interest loans',
                    application_link: 'https://sbi.co.in'
                }
            ]);
        }
        res.json(schemes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
