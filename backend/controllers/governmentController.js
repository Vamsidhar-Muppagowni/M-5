const { GovernmentScheme } = require('../models');

exports.getSchemes = async (req, res) => {
    try {
        const schemes = await GovernmentScheme.find();
        // Return dummy data if empty for demo
        if (schemes.length === 0) {
            return res.json([
                {
                    id: '1',
                    name: 'PM-KISAN',
                    description: 'Pradhan Mantri Kisan Samman Nidhi - Direct income support scheme providing financial assistance to farmer families across India.',
                    benefits: '₹6000 per year (₹2000 every 4 months, directly to bank account)',
                    application_link: 'https://pmkisan.gov.in',
                    eligibility_criteria: 'All land-holding farmer families with cultivable land. Excludes institutional landholders, former/current government employees, income tax payers, and professionals.',
                    required_documents: [
                        'Aadhaar Card (mandatory for verification)',
                        'Land ownership documents (Khasra/Khatauni)',
                        'Bank account with IFSC code',
                        'Mobile number linked to Aadhaar'
                    ],
                    how_to_apply: [
                        'Visit the official PM-KISAN website: pmkisan.gov.in',
                        'Click on "New Farmer Registration" on the homepage',
                        'Select your State and enter Aadhaar number',
                        'Fill in personal details: name, category, bank account',
                        'Upload land ownership documents (Khasra/Khatauni)',
                        'Enter bank details with IFSC code',
                        'Submit and note your registration number',
                        'Check status using "Beneficiary Status" option'
                    ],
                    important_dates: [
                        { label: 'Registration', value: 'Open year-round' },
                        { label: 'Installment 1', value: 'April - July' },
                        { label: 'Installment 2', value: 'August - November' },
                        { label: 'Installment 3', value: 'December - March' }
                    ]
                },
                {
                    id: '2',
                    name: 'KCC',
                    description: 'Kisan Credit Card Scheme - Provides affordable credit to farmers for agricultural needs, purchase of inputs, and other farm expenses.',
                    benefits: 'Loans up to ₹3 lakh at 4% interest rate (with interest subvention), crop insurance coverage, and flexible repayment options',
                    application_link: 'https://www.onlinesbi.sbi/prelogin/icchome.htm',
                    eligibility_criteria: 'Farmers (owner cultivators), tenant farmers, sharecroppers, SHGs, Joint Liability Groups of farmers. Must be engaged in crop production, animal husbandry, or fisheries.',
                    required_documents: [
                        'Aadhaar Card and PAN Card',
                        'Land ownership proof (7/12 extract, land record)',
                        'Passport-size photographs (2 copies)',
                        'Identity proof (Voter ID/Driving License)',
                        'Address proof',
                        'Cropping pattern details'
                    ],
                    how_to_apply: [
                        'Visit SBI Online: onlinesbi.sbi and click on "Agricultural/Rural Products"',
                        'Select "Kisan Credit Card" from the menu',
                        'Click "Apply Online" and fill the application form',
                        'Enter personal details: name, Aadhaar, PAN, address',
                        'Provide land details: survey number, area, crop pattern',
                        'Upload required documents in specified format',
                        'Submit application and note reference number',
                        'Visit nearest SBI branch for document verification',
                        'After verification, KCC will be issued within 14 days'
                    ],
                    important_dates: [
                        { label: 'Application', value: 'Open throughout the year' },
                        { label: 'Processing Time', value: '14-21 working days' },
                        { label: 'Card Validity', value: '5 years (annual renewal)' },
                        { label: 'Interest Subvention', value: 'Up to ₹3 lakh loans' }
                    ]
                }
            ]);
        }
        res.json(schemes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
