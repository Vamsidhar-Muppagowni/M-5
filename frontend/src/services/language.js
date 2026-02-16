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
    optional: 'Optional',
    price_too_high: 'Price seems too high. Please enter a realistic price.',
    price_too_low: 'Price must be at least ₹1',
    quantity_invalid: 'Quantity must be greater than 0',
    quantity_too_high: 'Quantity seems too high. Please verify.',

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
    error: 'Error',
    unable_open_link: 'Unable to open the application link.',
    something_wrong: 'Something went wrong. Please try again.',
    no_app_link: 'No application link available for this scheme.',

    // Validation
    phone_invalid: 'Phone number must be exactly 10 digits',
    email_invalid: 'Please enter a valid email address',

    // Crop Details Screen (Buyer side)
    current_price: 'Current Price',
    quality: 'Quality',
    variety_label: 'Variety',
    description_label: 'Description',
    no_description: 'No description available.',
    not_specified: 'Not specified',
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
    crop_images: 'Crop Images',

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
    
    // FAQ Questions and Answers
    faq_q1: 'How do I list my crops?',
    faq_a1: 'Go to the dashboard and click on "List New Crop". Fill in the details like crop name, quantity, and price, then upload a photo. Your listing will be visible to buyers immediately.',
    faq_q2: 'How do I accept a bid?',
    faq_a2: 'Check your "Pending Bids" section from the dashboard. You can view details of each bid including the buyer\'s offer amount and click "Accept" or "Reject".',
    faq_q3: 'Is my payment secure?',
    faq_a3: 'Yes, all transactions are secured and monitored. Payments are processed only after successful delivery confirmation. We use bank-grade encryption for all financial data.',
    faq_q4: 'How can I change my language?',
    faq_a4: 'Go to Profile -> Change Language and select your preferred language from the list. The app supports English, Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali, Marathi, and Gujarati.',
    faq_q5: 'How do I browse and bid on crops as a buyer?',
    faq_a5: 'Navigate to the "Browse" tab to see all available crop listings. Tap any listing to see details, then enter your bid amount and press "Place Bid". You\'ll be notified when the farmer responds.',
    faq_q6: 'What are Government Schemes and how do I apply?',
    faq_a6: 'The "Schemes" tab lists all current government agricultural schemes available for farmers. Tap any scheme to see full details including eligibility, required documents, and the application process. You can apply directly through the app.',
    faq_q7: 'How do I check current market prices?',
    faq_a7: 'Go to the "Prices" tab to see real-time market price trends for different crops. You can select specific crops and view 6-month price charts to make informed selling or buying decisions.',
    faq_q8: 'What should I do if my bid is rejected?',
    faq_a8: 'If your bid is rejected, you can place a new bid with a higher amount. Check the crop\'s current price and minimum price to ensure your bid is competitive. You can also browse other listings.',
    faq_q9: 'How do I edit or delete my crop listing?',
    faq_a9: 'Go to your dashboard and tap on "Active Listings". Find the listing you want to modify. You can view details or use the delete button to remove it from the marketplace.',
    faq_q10: 'How do I contact a farmer or buyer directly?',
    faq_a10: 'For privacy and security, direct contact details are shared only after a bid is accepted. Once a bid is accepted, both parties will receive each other\'s contact information to arrange delivery.',
    faq_q11: 'What crops can I list on the marketplace?',
    faq_a11: 'You can list any agricultural produce including grains (wheat, rice, maize), pulses, oilseeds, cash crops (cotton, sugarcane), fruits, vegetables, and spices. Make sure to provide accurate quality grade information.',
    faq_q12: 'How is the quality grade determined?',
    faq_a12: 'Quality grades range from A (premium) to D (basic). Grade A indicates the highest quality with minimal impurities. You should honestly assess your crop quality as buyers may verify upon delivery.',

    // Scheme Details extra
    required_documents: 'Required Documents',
    how_to_apply: 'How to Apply',
    important_dates: 'Important Dates',
    scheme_coverage: 'Scheme Coverage',
    
    // PM-KISAN Scheme Translations
    pmkisan_name: 'PM-KISAN',
    pmkisan_description: 'Pradhan Mantri Kisan Samman Nidhi - Direct income support scheme providing financial assistance to farmer families across India.',
    pmkisan_benefits: '₹6000 per year (₹2000 every 4 months, directly to bank account)',
    pmkisan_eligibility: 'All land-holding farmer families with cultivable land. Excludes institutional landholders, former/current government employees, income tax payers, and professionals.',
    pmkisan_doc1: 'Aadhaar Card (mandatory for verification)',
    pmkisan_doc2: 'Land ownership documents (Khasra/Khatauni)',
    pmkisan_doc3: 'Bank account with IFSC code',
    pmkisan_doc4: 'Mobile number linked to Aadhaar',
    pmkisan_step1: 'Visit the official PM-KISAN website: pmkisan.gov.in',
    pmkisan_step2: 'Click on "New Farmer Registration" on the homepage',
    pmkisan_step3: 'Select your State and enter Aadhaar number',
    pmkisan_step4: 'Fill in personal details: name, category, bank account',
    pmkisan_step5: 'Upload land ownership documents (Khasra/Khatauni)',
    pmkisan_step6: 'Enter bank details with IFSC code',
    pmkisan_step7: 'Submit and note your registration number',
    pmkisan_step8: 'Check status using "Beneficiary Status" option',
    pmkisan_date1_label: 'Registration',
    pmkisan_date1_value: 'Open year-round',
    pmkisan_date2_label: 'Installment 1',
    pmkisan_date2_value: 'April - July',
    pmkisan_date3_label: 'Installment 2',
    pmkisan_date3_value: 'August - November',
    pmkisan_date4_label: 'Installment 3',
    pmkisan_date4_value: 'December - March',
    
    // KCC Scheme Translations
    kcc_name: 'KCC',
    kcc_description: 'Kisan Credit Card Scheme - Provides affordable credit to farmers for agricultural needs, purchase of inputs, and other farm expenses.',
    kcc_benefits: 'Loans up to ₹3 lakh at 4% interest rate (with interest subvention), crop insurance coverage, and flexible repayment options',
    kcc_eligibility: 'Farmers (owner cultivators), tenant farmers, sharecroppers, SHGs, Joint Liability Groups of farmers. Must be engaged in crop production, animal husbandry, or fisheries.',
    kcc_doc1: 'Aadhaar Card and PAN Card',
    kcc_doc2: 'Land ownership proof (7/12 extract, land record)',
    kcc_doc3: 'Passport-size photographs (2 copies)',
    kcc_doc4: 'Identity proof (Voter ID/Driving License)',
    kcc_doc5: 'Address proof',
    kcc_doc6: 'Cropping pattern details',
    kcc_step1: 'Visit SBI Online: onlinesbi.sbi and click on "Agricultural/Rural Products"',
    kcc_step2: 'Select "Kisan Credit Card" from the menu',
    kcc_step3: 'Click "Apply Online" and fill the application form',
    kcc_step4: 'Enter personal details: name, Aadhaar, PAN, address',
    kcc_step5: 'Provide land details: survey number, area, crop pattern',
    kcc_step6: 'Upload required documents in specified format',
    kcc_step7: 'Submit application and note reference number',
    kcc_step8: 'Visit nearest SBI branch for document verification',
    kcc_step9: 'After verification, KCC will be issued within 14 days',
    kcc_date1_label: 'Application',
    kcc_date1_value: 'Open throughout the year',
    kcc_date2_label: 'Processing Time',
    kcc_date2_value: '14-21 working days',
    kcc_date3_label: 'Card Validity',
    kcc_date3_value: '5 years (annual renewal)',
    kcc_date4_label: 'Interest Subvention',
    kcc_date4_value: 'Up to ₹3 lakh loans',
    
    // Scheme Coverage translations
    coverage_target: 'Target',
    coverage_target_value: 'Small & Marginal Farmers',
    coverage_area: 'Coverage',
    coverage_area_value: 'All States & UTs',
    coverage_funding: 'Funding',
    coverage_funding_value: 'Central Government',

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
    
    // Image upload
    gallery: 'Gallery',
    camera: 'Camera',
    image_count_hint_optional: 'images uploaded (optional)',
    
    // ============ COMPREHENSIVE TOOLTIPS ============
    
    // Dashboard Stat Card Tooltips
    active_listings_tooltip: 'This shows the number of crops you currently have listed for sale in the marketplace. Active listings are visible to buyers who can place bids on them.',
    total_earnings_tooltip: 'Your total earnings from all completed sales on the platform. This includes only successfully completed transactions where payment has been received.',
    pending_bids_tooltip: 'Number of bids from buyers waiting for your response. Review these bids and accept, reject, or counter-offer to negotiate the best price for your crops.',
    completed_sales_tooltip: 'Total number of successful transactions you have completed. A sale is marked complete when the buyer receives the crop and payment is finalized.',
    
    // Crop Listing Tooltips
    image_tooltip: 'Upload up to 10 clear photos of your crop. Good photos help buyers make decisions faster and can increase your chances of getting better bids. Show different angles and quality of your produce.',
    description_tooltip: 'Provide helpful details about your crop: growing conditions, harvest date, any organic certifications, storage conditions, or special characteristics that make your produce stand out from others.',
    crop_name_tooltip: 'Enter the common name of your crop (e.g., Wheat, Rice, Cotton, Chilli). This helps buyers find your listing when they search.',
    variety_tooltip: 'Specify the variety or type of crop (e.g., Basmati for rice, Sharbati for wheat). Different varieties have different market values.',
    quantity_tooltip: 'Enter the total quantity of crop you want to sell. Make sure to select the correct unit (kg, quintal, ton). Be accurate as this affects buyer decisions.',
    min_price_tooltip: 'Set the minimum price you are willing to accept per unit. Buyers cannot bid below this amount. Set it based on current market rates and your production costs.',
    quality_grade_tooltip: 'Select the quality grade of your crop. Grade A is premium quality, B is good, C is standard, D is basic. Higher grades typically get better prices.',
    quality_tooltip: 'Quality grades help buyers understand your crop condition. Grade A: Premium quality with no defects. Grade B: Good quality with minor imperfections. Grade C: Standard/average quality. Grade D: Basic quality with more defects. Higher grades typically fetch better market prices.',
    district_tooltip: 'Enter your district or location. This helps buyers nearby find your crops and plan logistics for pickup or delivery.',
    
    // Market & Bidding Tooltips
    grade_tooltip: 'Quality grades indicate crop condition: Grade A (Premium - top quality, no defects), Grade B (Good - minor imperfections), Grade C (Standard - acceptable quality), Grade D (Basic - lower quality). Higher grades command better market prices.',
    current_price_tooltip: 'This is the current highest bid or asking price for the crop. It may change as buyers place new bids.',
    place_bid_tooltip: 'Enter your bid amount to make an offer on this crop. Your bid must be at least the minimum price set by the farmer. The farmer will review and respond to your bid.',
    market_description: 'Browse crops listed by farmers. Tap any listing to view details and place your bid. The farmer will review your bid and respond.',
    
    // Price Dashboard Tooltips  
    select_crop_tooltip: 'Choose a crop from the dropdown to view its price trends and market analysis. The chart will show price movements over the past 6 months to help you decide the best time to sell.',
    six_month_tooltip: 'This analysis shows the overall price movement over 6 months. Green percentage indicates price increase (good time to sell), red indicates decrease. Use this to plan when to list your crops.',
    price_chart_tooltip: 'This chart displays monthly average prices for the selected crop. Look for upward trends before selling and consider holding if prices are rising.',
    recent_updates_tooltip: 'Latest price updates from major mandis across India. These prices are updated daily and help you understand current market rates for different crops. Use this information to set competitive prices for your produce.',
    
    // Registration Tooltips
    role_tooltip: 'Select "Farmer" if you want to list and sell crops. Select "Buyer" if you want to browse and purchase crops from farmers. You can only have one role per account.',
    phone_tooltip: 'Enter your 10-digit mobile number. This will be used for login and receiving important notifications about bids and transactions.',
    password_tooltip: 'Create a strong password with at least 6 characters. Use a mix of letters and numbers for better security.',
    
    // Buyer Dashboard Tooltips
    active_bids_tooltip: 'Number of bids you have placed that are still pending response from farmers. Check back regularly as farmers may accept, reject, or counter your offers.',
    accepted_bids_tooltip: 'Bids that farmers have accepted. You should proceed to complete these transactions by arranging payment and pickup.',
    browse_market_tooltip: 'Explore all available crops listed by farmers. You can search, filter by quality, location, and price to find the best deals.',
    
    // Quick Actions Tooltips
    list_new_crop_tooltip: 'Create a new listing to sell your crops. Add details like crop name, quantity, quality grade, and your expected price. Buyers will be able to see your listing and place bids.',
    check_prices_tooltip: 'View current market prices and 6-month trends for different crops. Compare prices across mandis to decide the best time to sell your produce and set competitive prices.',
    
    // Scheme Details Tooltips
    scheme_benefits_tooltip: 'These are the financial benefits and support you will receive if your application is approved. Benefits are typically credited directly to your bank account.',
    eligibility_tooltip: 'Check if you meet these requirements before applying. Applications from ineligible persons may be rejected.',
    documents_tooltip: 'Gather all these documents before starting your application. Having complete documents speeds up the approval process.',
    
    // Weather & Location
    weather_tooltip: 'Current weather at your location. Weather conditions can affect crop prices and demand in the market.',
    
    // General
    info_tooltip: 'Tap for more information',
    got_it: 'Got it',
    
    // Scheme document translations (fallbacks)
    doc_aadhaar: 'Aadhaar Card (mandatory)',
    doc_land_records: 'Land ownership records / Patta',
    doc_bank_details: 'Bank account details with IFSC',
    doc_photos: 'Passport-size photographs (2 copies)',
    doc_income_cert: 'Income certificate from Tehsildar',
    
    // Scheme apply steps (fallbacks)
    apply_step_1: 'Visit the official scheme website',
    apply_step_2: 'Click on "New Registration" or "Apply Online"',
    apply_step_3: 'Fill in your personal and land details',
    apply_step_4: 'Upload required documents',
    apply_step_5: 'Submit and note your application number',
    apply_step_6: 'Track status online using your application ID',
    
    // Important dates (fallbacks)
    date_application: 'Application Window',
    date_year_round: 'Open year-round',
    date_processing: 'Processing Time',
    date_processing_value: '30-45 working days',
    date_disbursement: 'Benefit Disbursement',
    date_disbursement_value: 'Within 60 days of approval',
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
            },
            // Return empty string when key not found, so || fallback works
            returnEmptyString: false,
            returnNull: false,
            // This ensures we always get the translation value, not the key
            parseMissingKeyHandler: (key) => {
                // Return the English translation if available
                if (en[key]) {
                    return en[key];
                }
                return '';
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
