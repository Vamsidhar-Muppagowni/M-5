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
    voice_assistant: 'Voice Assistant',
    voice_assistant_desc: 'Speak to navigate or list',
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
    logout_confirm: 'Are you sure you want to logout?'
};

// Only English is hardcoded
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