const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const GovernmentScheme = require('../models/governmentScheme');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const schemes = [
    {
        name: 'Pradhan Mantri Fasal Bima Yojana',
        description: 'Crop insurance scheme providing financial support to farmers in case of crop failure due to natural disasters, pests or diseases.',
        benefits: 'Low premium crop insurance and compensation for crop loss due to drought, floods, pest attacks or other natural calamities.',
        eligibility_criteria: 'Farmers growing notified crops in notified areas. Both loanee and non-loanee farmers are eligible.',
        application_link: 'https://pmfby.gov.in',
        category: 'Insurance',
        state: 'Central',
        status: 'active',
        required_documents: [
            'Aadhaar Card',
            'Land ownership proof',
            'Bank account details',
            'Crop sowing certificate'
        ],
        how_to_apply: [
            'Visit pmfby.gov.in',
            'Register using Aadhaar',
            'Select crop and location',
            'Upload documents',
            'Submit the application',
            'Pay premium online'
        ],
        important_dates: [
            { label: 'Kharif Season', value: 'June to July' },
            { label: 'Rabi Season', value: 'October to November' }
        ],
        scheme_coverage: {
            target: 'All Farmers',
            coverage: 'All States',
            funding: 'Central and State Government'
        }
    },
    {
        name: 'Soil Health Card Scheme',
        description: 'Provides soil health cards to farmers with crop-wise nutrient recommendations to improve soil fertility and productivity.',
        benefits: 'Helps farmers optimize fertilizer use and improve soil quality.',
        eligibility_criteria: 'All farmers owning agricultural land.',
        application_link: 'https://soilhealth.dac.gov.in',
        category: 'Subsidy',
        state: 'Central',
        status: 'active',
        required_documents: [
            'Aadhaar Card',
            'Land ownership documents',
            'Mobile number'
        ],
        how_to_apply: [
            'Visit soilhealth.dac.gov.in',
            'Register farmer details',
            'Provide land information',
            'Soil sample is collected and tested',
            'Receive soil health card with recommendations'
        ],
        important_dates: [
            { label: 'Registration', value: 'Open throughout the year' }
        ],
        scheme_coverage: {
            target: 'All Farmers',
            coverage: 'All States',
            funding: 'Central Government'
        }
    },
    {
        name: 'Pradhan Mantri Krishi Sinchai Yojana',
        description: 'Ensures irrigation facilities for farms and improves water use efficiency.',
        benefits: 'Financial assistance for micro-irrigation systems and water conservation infrastructure.',
        eligibility_criteria: 'Farmers adopting irrigation and water conservation techniques.',
        application_link: 'https://pmksy.gov.in',
        category: 'Subsidy',
        state: 'Central',
        status: 'active',
        required_documents: [
            'Aadhaar Card',
            'Land ownership documents',
            'Bank details'
        ],
        how_to_apply: [
            'Visit pmksy.gov.in',
            'Register farmer details',
            'Submit irrigation proposal',
            'Upload required documents',
            'Submit application for subsidy'
        ],
        important_dates: [
            { label: 'Application', value: 'Open throughout the year' }
        ],
        scheme_coverage: {
            target: 'Farmers with cultivable land',
            coverage: 'All States',
            funding: 'Central and State Government'
        }
    },
    // --- Newly added schemes ---
    {
        name: 'PM-KISAN',
        description: 'Pradhan Mantri Kisan Samman Nidhi provides direct income support of ₹6000 per year to farmer families across India.',
        benefits: '₹6000 per year (₹2000 every four months) transferred directly to farmers\' bank accounts.',
        eligibility_criteria: 'All land-holding farmer families with cultivable land. Excludes institutional landholders, former or current government employees, income tax payers and professionals.',
        application_link: 'https://pmkisan.gov.in',
        category: 'Income Support',
        state: 'Central',
        status: 'active',
        required_documents: [
            'Aadhaar Card',
            'Land ownership documents',
            'Bank account with IFSC code',
            'Mobile number linked to Aadhaar'
        ],
        how_to_apply: [
            'Visit pmkisan.gov.in',
            'Click New Farmer Registration',
            'Enter Aadhaar number',
            'Fill personal and bank details',
            'Upload land documents',
            'Submit the application',
            'Track beneficiary status on the portal'
        ],
        important_dates: [
            { label: 'Registration', value: 'Open year-round' },
            { label: 'Installment 1', value: 'April to July' },
            { label: 'Installment 2', value: 'August to November' },
            { label: 'Installment 3', value: 'December to March' }
        ],
        scheme_coverage: {
            target: 'Small & Marginal Farmers',
            coverage: 'All States & UTs',
            funding: 'Central Government'
        }
    },
    {
        name: 'Kisan Credit Card',
        description: 'Provides farmers with affordable credit for agricultural needs, purchase of inputs and farm expenses.',
        benefits: 'Loans up to ₹3 lakh at subsidized interest rates with flexible repayment options.',
        eligibility_criteria: 'Farmers engaged in agriculture, animal husbandry or fisheries.',
        application_link: 'https://www.onlinesbi.sbi/prelogin/icchome.htm',
        category: 'Loan',
        state: 'Central',
        status: 'active',
        required_documents: [
            'Aadhaar Card',
            'PAN Card',
            'Land ownership proof',
            'Passport size photos'
        ],
        how_to_apply: [
            'Visit your nearest bank branch',
            'Fill KCC application form',
            'Submit identity and land documents',
            'Bank verifies application',
            'Receive Kisan Credit Card'
        ],
        important_dates: [
            { label: 'Application', value: 'Open throughout the year' },
            { label: 'Card Validity', value: '5 years' }
        ],
        scheme_coverage: {
            target: 'Farmers',
            coverage: 'All States',
            funding: 'Central Government'
        }
    },
    // ── 5 new schemes ────────────────────────────────────────────────────────
    {
        name: 'Paramparagat Krishi Vikas Yojana',
        description: 'Promotes organic farming through cluster-based certification and support.',
        benefits: 'Financial assistance for organic inputs, certification and marketing support.',
        eligibility_criteria: 'Farmers willing to adopt organic farming methods.',
        application_link: 'https://pgsindia-ncof.gov.in',
        category: 'Subsidy',
        state: 'Central',
        status: 'active',
        required_documents: ['Aadhaar Card', 'Land ownership documents', 'Bank details'],
        how_to_apply: [
            'Register through the PKVY portal',
            'Join an organic farming cluster',
            'Submit required documents',
            'Receive certification and subsidy support'
        ],
        important_dates: [{ label: 'Application', value: 'Open throughout the year' }],
        scheme_coverage: { target: 'Organic Farmers', coverage: 'All States', funding: 'Central Government' }
    },
    {
        name: 'National Mission for Sustainable Agriculture',
        description: 'Promotes climate resilient agriculture and efficient use of water and soil resources.',
        benefits: 'Financial support for water conservation, soil management and climate resilient farming.',
        eligibility_criteria: 'Farmers adopting sustainable agricultural practices.',
        application_link: 'https://nmsa.dac.gov.in',
        category: 'Subsidy',
        state: 'Central',
        status: 'active',
        required_documents: ['Aadhaar Card', 'Land records', 'Bank account details'],
        how_to_apply: [
            'Register through the NMSA portal',
            'Submit project proposal',
            'Upload documents',
            'Apply for subsidy support'
        ],
        important_dates: [{ label: 'Application', value: 'Open year-round' }],
        scheme_coverage: { target: 'All Farmers', coverage: 'All States', funding: 'Central Government' }
    },
    {
        name: 'National Agriculture Market (eNAM)',
        description: 'Online trading platform connecting farmers and buyers across India for transparent price discovery.',
        benefits: 'Better market access and transparent crop pricing.',
        eligibility_criteria: 'Farmers registered with APMC mandis.',
        application_link: 'https://www.enam.gov.in',
        category: 'Market',
        state: 'Central',
        status: 'active',
        required_documents: ['Aadhaar Card', 'Bank account details', 'Farmer registration'],
        how_to_apply: [
            'Register on the eNAM portal',
            'Verify Aadhaar and bank details',
            'Start selling produce online'
        ],
        important_dates: [{ label: 'Registration', value: 'Open throughout the year' }],
        scheme_coverage: { target: 'Farmers and traders', coverage: 'All States', funding: 'Central Government' }
    },
    {
        name: 'Agriculture Infrastructure Fund',
        description: 'Provides financial support for building agriculture infrastructure such as warehouses and cold storage.',
        benefits: 'Interest subvention and credit guarantee for agriculture infrastructure projects.',
        eligibility_criteria: 'Farmers, FPOs, agri entrepreneurs and cooperatives.',
        application_link: 'https://agriinfra.dac.gov.in',
        category: 'Loan',
        state: 'Central',
        status: 'active',
        required_documents: ['Aadhaar Card', 'Project proposal', 'Bank account details'],
        how_to_apply: [
            'Apply through the Agriculture Infrastructure Fund portal',
            'Submit infrastructure project details',
            'Upload required documents'
        ],
        important_dates: [{ label: 'Application', value: 'Open throughout the year' }],
        scheme_coverage: { target: 'Farmers and agri entrepreneurs', coverage: 'All States', funding: 'Central Government' }
    },
    {
        name: 'Mission for Integrated Development of Horticulture',
        description: 'Promotes holistic growth of horticulture sector including fruits, vegetables and flowers.',
        benefits: 'Financial assistance for horticulture cultivation and infrastructure.',
        eligibility_criteria: 'Farmers involved in horticulture production.',
        application_link: 'https://midh.gov.in',
        category: 'Subsidy',
        state: 'Central',
        status: 'active',
        required_documents: ['Aadhaar Card', 'Land ownership proof', 'Bank details'],
        how_to_apply: [
            'Register on the MIDH portal',
            'Submit horticulture project proposal',
            'Apply for financial assistance'
        ],
        important_dates: [{ label: 'Application', value: 'Open year-round' }],
        scheme_coverage: { target: 'Horticulture Farmers', coverage: 'All States', funding: 'Central Government' }
    }
];

async function seed() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        for (const schemeData of schemes) {
            // Check if scheme already exists by name
            const existingScheme = await GovernmentScheme.findOne({ name: schemeData.name });
            if (!existingScheme) {
                await GovernmentScheme.create(schemeData);
                console.log(`Inserted: ${schemeData.name}`);
            } else {
                console.log(`Skipped (already exists): ${schemeData.name}`);
            }
        }

        console.log('Government schemes inserted successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
