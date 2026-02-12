import i18n from 'i18next';
import {
    initReactI18next
} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import axios from 'axios';

// English is the source of truth
const en = {
    welcome: 'Welcome',
    login: 'Login',
    register: 'Register',
    dashboard: 'Dashboard',
    market: 'Market',
    phone_placeholder: 'Phone Number',
    password_placeholder: 'Password',
    name_placeholder: 'Full Name',
    email_placeholder: 'Email (Optional)',
    farmer_type: 'I am a Farmer',
    buyer_type: 'I am a Buyer',
    login_button: 'Login',
    register_button: 'Register',
    no_account: "Don't have an account? Register",
    have_account: "Already have an account? Login",
    error_fill_fields: 'Please fill all fields',
    success_otp: 'OTP sent to your phone',
    logout: 'Logout',
    profile_settings: 'Profile Settings',
    active_listings: 'Active Listings',
    total_earnings: 'Total Earnings',
    pending_bids: 'Pending Bids',
    completed_sales: 'Completed Sales',
    quick_actions: 'Quick Actions',
    list_new_crop: 'List New Crop',
    list_crop_desc: 'Upload crop details for sale',
    check_prices: 'Check Market Prices',
    check_prices_desc: 'View mandi rates & trends',

    welcome_greeting: 'Namaste',
    welcome_subtitle: 'Welcome to your dashboard',
    partly_cloudy: 'Partly Cloudy',
    your_location: 'Your Location',
    // Tab Navigation
    dashboard_tab: 'Dashboard',
    market_tab: 'Market',
    prices_tab: 'Prices',
    schemes_tab: 'Schemes',
    profile_tab: 'Profile',
    browse_tab: 'Browse',
    my_bids_tab: 'My Bids',
    // Weather
    weather_clear: 'Clear Sky',
    weather_cloudy: 'Partly Cloudy',
    weather_rainy: 'Rainy',
    weather_snow: 'Snow',
    weather_thunder: 'Thunderstorm',
    weather_fog: 'Foggy',
    weather_loading: 'Loading Weather...',
    // Profile
    profile_title: 'Profile Settings',
    edit_profile: 'Edit Profile',
    change_language: 'Change Language',
    help_support: 'Help & Support',
    logout: 'Logout',
    logout_confirm: 'Are you sure you want to logout?',
    // Buyer Dashboard
    welcome_back: 'Welcome back',
    marketplace_dashboard: 'Marketplace Dashboard',
    active_bids: 'Active Bids',
    accepted_bids: 'Accepted',
    browse_market: 'Browse Market',
    market_trends: 'Market Trends',
    view_chart: 'View Chart',
    buy_crops: 'Buy Crops',
    buyer_stat_active: 'Active',
    buyer_stat_accepted: 'Accepted',

    // Roles
    role_farmer: 'FARMER',
    role_buyer: 'BUYER',
    role_admin: 'ADMIN',
    unknown_role: 'USER',

    // Crop Listing
    crop_details: 'Crop Details',
    crop_name: 'Crop Name',
    crop_name_placeholder: 'e.g. Wheat, Rice',
    variety: 'Variety (Optional)',
    variety_placeholder: 'e.g. Basmati',
    quantity: 'Quantity',
    unit: 'Unit',
    expected_price: 'Expected Price (₹)',
    min_price_placeholder: 'Minimum price',
    quality_grade: 'Quality Grade',
    description: 'Description',
    description_placeholder: 'Additional details about the crop...',
    district: 'District',
    district_placeholder: 'e.g. Guntur',
    list_crop_button: 'List Crop Market',
    listing: 'Listing...',
    crop_listed_success: 'Crop Listed!',
    crop_listed_message: 'Your crop has been successfully added to the marketplace.',
    back_to_dashboard: 'Back to Dashboard',
    fill_required: 'Please fill required fields',

    // My Crops
    my_active_listings: 'My Active Listings',
    no_active_listings: 'No Active Listings',
    no_active_listings_desc: "You haven't listed any crops for sale yet.",
    list_first_crop: 'List Your First Crop',
    views: 'Views',
    bids: 'Bids',
    listed_date: 'Listed',
    delete_listing: 'Delete Listing',
    delete_confirm: 'Are you sure you want to remove this crop from the market?',
    delete_soon: 'Delete feature coming soon',
    cancel: 'Cancel',
    delete: 'Delete',

    // Pending Bids
    pending_bids_title: 'Pending Bids',
    no_pending_bids: 'No pending bids found',
    buyer: 'Buyer',
    min: 'Min',
    qty: 'Qty',
    offer: 'Offer',
    accept: 'Accept',
    reject: 'Reject',
    bid_accepted: 'Bid Accepted Successfully!',
    bid_rejected: 'Bid Rejected.',
    failed_to_fetch_bids: 'Failed to fetch bids',

    // Market
    search_placeholder: 'Search crops, farmers...',
    loading_market: 'Loading Marketplace...',
    no_crops_found: 'No crops found',
    try_adjusting_search: 'Try adjusting your search terms',
    details: 'Details',
    by: 'By',
    grade: 'Grade',

    // Price Dashboard
    market_price_trends: 'Market Price Trends',
    select_crop: 'Select Crop',
    price_analysis: 'Price Analysis',
    last_6_months: 'Last 6 Months',
    recent_market_updates: 'Recent Market Updates',
    no_recent_updates: 'No recent updates available.',
    upward_trend: 'Upward',
    downward_trend: 'Downward',
    stable_trend: 'Stable',
    trend_in_last_month: 'trend in last month',
    six_month_analysis: '6-Month Analysis',
    loading: 'Loading...',

    // Government Schemes
    government_schemes: 'Government Schemes',
    ministry_agriculture: 'Ministry of Agriculture',
    benefits_label: 'Benefits:',
    view_details_apply: 'View Details & Apply',
    no_schemes: 'No schemes available at the moment.',
    scheme_details: 'Scheme Details',
    eligibility: 'Eligibility',
    apply_now: 'Apply Now',
    apply_online: 'Apply Online',
    scheme_info: 'Scheme Information',

    // Login Errors
    invalid_credentials: 'Invalid Credentials',
    invalid_credentials_msg: 'The phone number or password you entered is incorrect. Please try again.',

    // Validation
    phone_invalid: 'Phone number must be exactly 10 digits',
    email_invalid: 'Please enter a valid email address',

    // Crop Details Screen (Buyer side)
    current_price: 'Current Price',
    quality: 'Quality',
    variety_label: 'Variety',
    description_label: 'Description',
    no_description: 'No description available.',
    location: 'Location',
    farmer_label: 'Farmer',
    place_a_bid: 'Place a Bid',
    enter_bid_amount: 'Enter amount (Min ₹{min})',
    place_bid: 'Place Bid',
    placing_bid: 'Placing Bid...',
    bid_placed: 'Bid Placed!',
    bid_placed_msg: 'You successfully placed a bid of ₹{amount} for {crop}.',
    enter_bid_error: 'Enter bid amount',
    bid_failed: 'Failed to place bid',
    load_failed: 'Failed to load details',
    crop_not_found: 'Crop not found',

    // My Bids Screen (Buyer side)
    my_bids: 'My Bids',
    no_bids_yet: 'No bids placed yet.',
    start_bidding: 'Start bidding on crops to see them here.',
    my_bid_label: 'My Bid:',
    date_label: 'Date:',
    farmer_colon: 'Farmer:',

    // Help & Support
    need_help: 'Need immediate help?',
    support_available: 'Our support team is available 24/7',
    call_helpline: 'Call Helpline',
    email_support: 'Email Support',
    faq_title: 'Frequently Asked Questions',

    // Scheme Details extra
    required_documents: 'Required Documents',
    how_to_apply: 'How to Apply',
    important_dates: 'Important Dates',
    scheme_coverage: 'Scheme Coverage',

    // Select Role
    select_role: 'Select Role',
    i_am_a: 'I am a...',
    sign_in: 'Sign In →',
    dont_have_account: "Don't have an account?",
    register_new_farm: 'Register New Farm',
    forgot_password: 'Forgot Password?',
    login_header: 'Login',
    join_community: 'Join our community of farmers and buyers',
    login_here: 'Login Here',

    // FAQ
    faq_q1: "How do I list my crops?",
    faq_a1: "Go to the dashboard and click on 'List New Crop'. Fill in the details like crop name, quantity, and price, then upload a photo. Your listing will be visible to buyers immediately.",
    faq_q2: "How do I accept a bid?",
    faq_a2: "Check your 'Pending Bids' section from the dashboard. You can view details of each bid including the buyer's offer amount and click 'Accept' or 'Reject'.",
    faq_q3: "Is my payment secure?",
    faq_a3: "Yes, all transactions are secured and monitored. Payments are processed only after successful delivery confirmation. We use bank-grade encryption for all financial data.",
    faq_q4: "How can I change my language?",
    faq_a4: "Go to Profile -> Change Language and select your preferred language from the list. The app supports English, Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali, Marathi, and Gujarati.",
    faq_q5: "How do I browse and bid on crops as a buyer?",
    faq_a5: "Navigate to the 'Browse' tab to see all available crop listings. Tap any listing to see details, then enter your bid amount and press 'Place Bid'. You'll be notified when the farmer responds.",
    faq_q6: "What are Government Schemes and how do I apply?",
    faq_a6: "The 'Schemes' tab lists all current government agricultural schemes available for farmers. Tap any scheme to see full details including eligibility, required documents, and the application process. You can apply directly through the app.",
    faq_q7: "How do I check current market prices?",
    faq_a7: "Go to the 'Prices' tab to see real-time market price trends for different crops. You can select specific crops and view 6-month price charts to make informed selling or buying decisions.",
    faq_q8: "What should I do if my bid is rejected?",
    faq_a8: "If your bid is rejected, you can place a new bid with a higher amount. Check the crop's current price and minimum price to ensure your bid is competitive. You can also browse other listings.",
    faq_q9: "How do I edit or delete my crop listing?",
    faq_a9: "Go to your dashboard and tap on 'Active Listings'. Find the listing you want to modify. You can view details or use the delete button to remove it from the marketplace.",
    faq_q10: "How do I contact a farmer or buyer directly?",
    faq_a10: "For privacy and security, direct contact details are shared only after a bid is accepted. Once a bid is accepted, both parties will receive each other's contact information to arrange delivery.",
    faq_q11: "What crops can I list on the marketplace?",
    faq_a11: "You can list any agricultural produce including grains (wheat, rice, maize), pulses, oilseeds, cash crops (cotton, sugarcane), fruits, vegetables, and spices. Make sure to provide accurate quality grade information.",
    faq_q12: "How is the quality grade determined?",
    faq_a12: "Quality grades range from A (premium) to D (basic). Grade A indicates the highest quality with minimal impurities. You should honestly assess your crop quality as buyers may verify upon delivery.",

    // AI Insights Screen
    ai_insights: 'AI Insights',
    analyzing_market: 'Analyzing market data...',
    market_intelligence: 'Market Intelligence',
    price_trend: 'Price Trend',
    buyer_interest: 'Buyer Interest',
    supply_level: 'Supply Level',
    market_sentiment: 'Market Sentiment',
    best_time_to_sell: 'Best Time to Sell',
    now_good_time: 'Now is a good time to sell!',
    wait_better_prices: 'Consider waiting for better prices',
    recommended_crops: 'Recommended Crops',
    based_on_conditions: 'Based on your location and soil conditions',
    no_recommendations: 'No recommendations available',
    suitability: 'Suitability',
    profit_margin: 'Profit',
    water_requirement: 'Water',
    duration: 'Duration',
    expected_price_30days: 'Expected Price (30 days)',
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW',
    up: 'UP',
    down: 'DOWN',
    stable: 'STABLE',
    positive: 'POSITIVE',
    negative: 'NEGATIVE',
    neutral: 'NEUTRAL',
    very_positive: 'VERY POSITIVE',
    unknown: 'UNKNOWN'
};
const resources = {
    en: {
        translation: en
    }
};

// Google Translate Helper (Unofficial Free Endpoint)
// Keep track of failed translations to avoid spamming logs
const failedTranslations = new Set();

const translateText = async (text, targetLang) => {
    if (targetLang === 'en') return text;

    // Create a unique key for this translation attempt
    const cacheKey = `${text}_${targetLang}`;
    if (failedTranslations.has(cacheKey)) {
        return text;
    }

    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await axios.get(url);
        // Response format: [[["Translated Text","Source Text",...],...],...] 
        if (response.data && response.data[0] && response.data[0][0] && response.data[0][0][0]) {
            return response.data[0][0][0];
        }
        return text; // Fallback
    } catch (error) {
        // Only log network errors once per term
        if (!failedTranslations.has(cacheKey)) {
            console.warn(`Translation failed for "${text}":`, error.message);
            failedTranslations.add(cacheKey);
        }
        return text;
    }
};

// Recursively translate an object
const translateObject = async (obj, targetLang) => {
    const translated = {};
    const keys = Object.keys(obj);

    // Process in parallel chunks to avoid timeout/rate limit issues if possible, 
    // but for simplicity map all. Note: Browser concurrent limit applies.
    await Promise.all(keys.map(async (key) => {
        if (typeof obj[key] === 'string') {
            translated[key] = await translateText(obj[key], targetLang);
        } else if (typeof obj[key] === 'object') {
            translated[key] = await translateObject(obj[key], targetLang);
        } else {
            translated[key] = obj[key];
        }
    }));

    return translated;
};

export const initI18n = async () => {
    const savedLanguage = await AsyncStorage.getItem('appLanguage');
    const locales = Localization.getLocales();
    const deviceLanguage = locales && locales.length > 0 ? locales[0].languageCode : 'en';
    const defaultLanguage = savedLanguage || deviceLanguage; // Default to saved or device

    await i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: 'en', // Always start with English until we load dynamic
            fallbackLng: 'en',
            interpolation: {
                escapeValue: false
            },
            compatibilityJSON: 'v3',
            react: {
                useSuspense: false
            }
        });

    // If default is not English, load it dynamically
    if (defaultLanguage !== 'en') {
        await changeLanguage(defaultLanguage);
    }
};

export const changeLanguage = async (language) => {
    if (language === 'en') {
        await i18n.changeLanguage('en');
        await AsyncStorage.setItem('appLanguage', 'en');
        return;
    }

    // Check if we already loaded this language session
    if (i18n.hasResourceBundle(language, 'translation')) {
        await i18n.changeLanguage(language);
        await AsyncStorage.setItem('appLanguage', language);
        return;
    }

    // Dynamic Translation
    console.log(`[i18n] Translating resources to ${language}...`);
    try {
        const translatedResources = await translateObject(en, language);
        i18n.addResourceBundle(language, 'translation', translatedResources, true, true);
        await i18n.changeLanguage(language);
        await AsyncStorage.setItem('appLanguage', language);
    } catch (error) {
        console.error('Failed to switch language:', error);
        // Fallback or alert?
    }
};

export default i18n;
