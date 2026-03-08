import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, Image, StatusBar, Dimensions, useWindowDimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { changeLanguage } from '../../services/language';
import api, { marketAPI } from '../../services/api';
import * as Location from 'expo-location';
import { LineChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../styles/theme';
import Tooltip from '../../components/Tooltip';

// ── Defensive helpers ─────────────────────────────────────────────────────────
const safeArr = (v) => Array.isArray(v) ? v : [];
const safeStr = (v) => (v != null ? String(v) : '');

const FarmerDashboard = ({ navigation }) => {
    const { user } = useSelector(state => state.auth);
    const { t, i18n } = useTranslation();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const [stats, setStats] = useState({
        activeListings: 0,
        totalSales: 0,
        pendingBids: 0,
        earnings: 0,
        rating: 0,
        rating_count: 0
    });
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // Price Chart State
    const [priceHistory, setPriceHistory] = useState(null);
    const [priceLoading, setPriceLoading] = useState(true);

    const [weather, setWeather] = useState({
        temp: '--',
        conditionKey: 'weather_loading',
        location: 'Loading...',
        icon: 'cloud-outline',
        color: '#ccc'
    });

    const getWeatherIcon = (code) => {
        // WMO Weather interpretation codes (WW)
        if (code === 0) return { name: 'sunny', color: '#fdd835', key: 'weather_clear' };
        if ([1, 2, 3].includes(code)) return { name: 'partly-sunny', color: '#ffb74d', key: 'weather_cloudy' };
        if ([45, 48].includes(code)) return { name: 'cloudy', color: '#90a4ae', key: 'weather_fog' };
        if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { name: 'rainy', color: '#4fc3f7', key: 'weather_rainy' };
        if ([71, 73, 75, 77, 85, 86].includes(code)) return { name: 'snow', color: '#e0e0e0', key: 'weather_snow' };
        if ([95, 96, 99].includes(code)) return { name: 'thunderstorm', color: '#ffd600', key: 'weather_thunder' };
        return { name: 'cloud-outline', color: '#ccc', key: 'weather_cloudy' };
    };

    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setWeather(prev => ({
                        ...prev,
                        location: 'Permission Denied',
                        conditionKey: 'weather_cloudy',
                        temp: '--'
                    }));
                    return;
                }

                // Add timeout to prevent hanging
                const getLocationPromise = (async () => {
                    // Try last known position first (faster)
                    let lastKnown = await Location.getLastKnownPositionAsync({});
                    if (lastKnown) return lastKnown;
                    // If not, fetch fresh position
                    return await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                })();

                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Location timeout')), 20000));

                let location = await Promise.race([getLocationPromise, timeoutPromise]);
                if (!location) throw new Error('Location unavailable');

                const { latitude, longitude } = location.coords;

                // Fetch Weather
                const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
                if (!response.ok) throw new Error('Weather API failed');

                const data = await response.json();
                const { temperature, weathercode } = data.current_weather;
                const iconData = getWeatherIcon(weathercode);

                // Reverse Geocode using OpenStreetMap (Nominatim)
                let city = "Unknown Location";
                try {
                    const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
                    const geoResponse = await fetch(geoUrl, {
                        headers: { 'User-Agent': 'FarmerMarketplaceApp/1.0' }
                    });
                    const geoData = await geoResponse.json();

                    if (geoData && geoData.address) {
                        const addr = geoData.address;
                        city = addr.city || addr.town || addr.village || addr.county || addr.suburb || addr.state_district || "Unknown Location";
                    } else {
                        let address = await Location.reverseGeocodeAsync({ latitude, longitude });
                        // STEP 2: safeArr guard — address can be undefined on web reload
                        if (safeArr(address).length > 0) {
                            const addr = address[0];
                            city = addr.city || addr.subregion || addr.district || addr.region || addr.name || "Unknown Location";
                        }
                    }
                } catch (geoError) {
                    console.warn("Geocoding failed:", geoError);
                    city = "Location Detected";
                }

                setWeather({
                    temp: `${Math.round(temperature)}°C`,
                    conditionKey: iconData.key,
                    location: city,
                    icon: iconData.name,
                    color: iconData.color
                });

            } catch (error) {
                console.error("Weather/Location error:", error);
                setWeather({
                    temp: '--',
                    conditionKey: 'partly_cloudy',
                    location: 'Unavailable',
                    icon: 'cloud-offline-outline',
                    color: '#ccc'
                });
            }
        })();
    }, []);

    const defaultStats = {
        activeListings: 0,
        totalSales: 0,
        pendingBids: 0,
        earnings: 0,
        rating: 0,
        rating_count: 0
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/farmer/stats');
            // Guard: only use response if it's a plain object, not array/null
            const data = response.data;
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                setStats({ ...defaultStats, ...data });
            }

            // Fetch Price History for Wheat — endpoint returns object, not array
            setPriceLoading(true);
            try {
                const historyRes = await marketAPI.getPriceHistory({ crop: 'Wheat', location: 'India' });
                const hData = historyRes?.data;

                // PriceDashboard format: { labels:[], datasets:[{data:[]}] }
                if (hData && Array.isArray(hData.datasets) && hData.datasets.length > 0) {
                    const dataset = hData.datasets[0];
                    const rawData = Array.isArray(dataset?.data) ? dataset.data : [];
                    const labels = Array.isArray(hData.labels) ? hData.labels : rawData.map((_, i) => String(i + 1));
                    if (rawData.length > 0) {
                        setPriceHistory({ labels, datasets: [{ data: rawData }] });
                    } else {
                        setPriceHistory(null);
                    }
                    // Legacy array format: [{date, price}]
                } else if (Array.isArray(hData) && hData.length > 0) {
                    const last7 = hData.slice(-7);
                    setPriceHistory({
                        labels: last7.map(h => new Date(h.date).getDate().toString()),
                        datasets: [{ data: last7.map(h => parseFloat(h.price) || 0) }]
                    });
                } else {
                    // Fallback dummy data
                    setPriceHistory({
                        labels: ["1", "2", "3", "4", "5", "6", "7"],
                        datasets: [{ data: [2200, 2250, 2300, 2280, 2350, 2400, 2450] }]
                    });
                }
            } catch (chartErr) {
                console.warn("Chart fetch error", chartErr);
                setPriceHistory({
                    labels: ["1", "2", "3", "4", "5", "6", "7"],
                    datasets: [{ data: [2200, 2250, 2300, 2280, 2350, 2400, 2450] }]
                });
            }
            setPriceLoading(false);
        } catch (error) {
            console.error('fetchStats error:', error);
            setPriceLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    }, []);

    // Use useFocusEffect to refresh stats when screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchStats();
        }, [])
    );

    const languages = [
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'hi', label: 'हिंदी (Hindi)', flag: '🇮🇳' },
        { code: 'te', label: 'తెలుగు (Telugu)', flag: '🇮🇳' },
        { code: 'ta', label: 'தமிழ் (Tamil)', flag: '🇮🇳' },
        { code: 'kn', label: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
        { code: 'ml', label: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
        { code: 'bn', label: 'বাংলা (Bengali)', flag: '🇮🇳' },
        { code: 'mr', label: 'मराठी (Marathi)', flag: '🇮🇳' },
        { code: 'gu', label: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' }
    ];

    const handleLanguageChange = (langCode) => {
        changeLanguage(langCode);
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />

            {/* Professional Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.greetingSubtitle}>{t('welcome_greeting')},</Text>
                    <Text style={styles.greetingTitle}>{user?.name?.split(' ')[0] || 'Farmer'}!</Text>
                </View>

                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.languageButton} onPress={() => setModalVisible(true)}>
                        {/* STEP 4: i18n.language can be undefined during reload */}
                        <Text style={styles.languageButtonText}>{safeStr(i18n?.language || 'en').toUpperCase()}</Text>
                        <Ionicons name="chevron-down" size={16} color={theme.colors.primary} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>

                    <View style={{ alignItems: 'flex-end', marginRight: 10, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: theme.colors.text.primary }}>⭐ {stats.rating > 0 ? stats.rating : 'New'}</Text>
                        <Text style={{ fontSize: 10, color: theme.colors.text.secondary }}>({stats.rating_count} {t('ratings') || 'ratings'})</Text>
                    </View>

                    <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
                        <LinearGradient
                            colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                            style={styles.avatar}
                        >
                            <Text style={styles.avatarText}>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Language Selection Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={[styles.modalContent, isDesktop && styles.modalContentDesktop]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Language</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.text.secondary} />
                            </TouchableOpacity>
                        </View>

                        {languages.map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                style={[
                                    styles.languageOption,
                                    i18n.language === lang.code && styles.languageOptionActive
                                ]}
                                onPress={() => handleLanguageChange(lang.code)}
                            >
                                <Text style={styles.languageFlag}>{lang.flag}</Text>
                                <Text style={[
                                    styles.languageLabel,
                                    i18n.language === lang.code && styles.languageLabelActive
                                ]}>
                                    {lang.label}
                                </Text>
                                {i18n.language === lang.code && (
                                    <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
                contentContainerStyle={isDesktop ? styles.contentContainerDesktop : null}
            >
                {/* Weather/Status Card */}
                <LinearGradient
                    colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                    style={styles.weatherCard}
                >
                    <View>
                        <Text style={styles.weatherTemp}>{weather.temp}</Text>
                        <Text style={styles.weatherCondition}>{t(weather.conditionKey)}</Text>
                        <Text style={styles.weatherLocation}>
                            <Ionicons name="location" size={14} color="#fff" /> {weather.location}
                        </Text>
                    </View>
                    <Ionicons name={weather.icon} size={48} color={weather.color} />
                </LinearGradient>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <TouchableOpacity style={[styles.statCard, isDesktop && styles.statCardDesktop]} onPress={() => navigation.navigate('MyCrops')}>
                        <View style={[styles.iconContainer, { backgroundColor: '#e8f5e9' }]}>
                            <Ionicons name="leaf" size={24} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.statValue}>{stats.activeListings}</Text>
                        <View style={styles.statLabelRow}>
                            <Text style={styles.statLabel}>{t('active_listings') || 'Active Listings'}</Text>
                            <Tooltip text={safeStr(t('active_listings_tooltip')) || 'Number of crops you currently have listed for sale.'} iconSize={14} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.statCard, isDesktop && styles.statCardDesktop]}>
                        <View style={[styles.iconContainer, { backgroundColor: '#fff3e0' }]}>
                            <Ionicons name="cash" size={24} color={theme.colors.secondary} />
                        </View>
                        <Text style={styles.statValue}>₹{stats.earnings}</Text>
                        <View style={styles.statLabelRow}>
                            <Text style={styles.statLabel}>{t('total_earnings') || 'Total Earnings'}</Text>
                            <Tooltip text={safeStr(t('total_earnings_tooltip')) || 'Total amount you have earned from all completed crop sales.'} iconSize={14} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.statCard, isDesktop && styles.statCardDesktop]} onPress={() => navigation.navigate('PendingBids')}>
                        <View style={[styles.iconContainer, { backgroundColor: '#e3f2fd' }]}>
                            <Ionicons name="time" size={24} color="#1565c0" />
                        </View>
                        <Text style={styles.statValue}>{stats.pendingBids}</Text>
                        <View style={styles.statLabelRow}>
                            <Text style={styles.statLabel}>{t('pending_bids') || 'Pending Bids'}</Text>
                            <Tooltip text={safeStr(t('pending_bids_tooltip')) || 'Bids from buyers waiting for your review.'} iconSize={14} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.statCard, isDesktop && styles.statCardDesktop]}>
                        <View style={[styles.iconContainer, { backgroundColor: '#f3e5f5' }]}>
                            <Ionicons name="checkmark-circle" size={24} color="#7b1fa2" />
                        </View>
                        <Text style={styles.statValue}>{stats.totalSales}</Text>
                        <View style={styles.statLabelRow}>
                            <Text style={styles.statLabel}>{t('completed_sales') || 'Completed Sales'}</Text>
                            <Tooltip text={safeStr(t('completed_sales_tooltip')) || 'Total number of successful crop sales you have completed.'} iconSize={14} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Market Trends Chart (NEW) */}
                <View style={[styles.sectionHeader, { paddingHorizontal: 20, marginTop: 10 }]}>
                    <Text style={styles.sectionTitle}>{t('market_trends') || 'Market Trends'} (Wheat)</Text>
                </View>

                <View style={[styles.chartContainer, isDesktop && styles.chartContainerDesktop]}>
                    {priceLoading ? (
                        <Text style={{ padding: 20 }}>Loading Chart...</Text>
                    ) : priceHistory ? (
                        <LineChart
                            data={{
                                labels: priceHistory.labels,
                                datasets: priceHistory.datasets
                            }}
                            width={isDesktop ? Math.min(Dimensions.get('window').width - 60, 800) : Dimensions.get('window').width - 60}
                            height={220}
                            yAxisLabel="Rs"
                            yAxisInterval={1}
                            chartConfig={{
                                backgroundColor: theme.colors.surface,
                                backgroundGradientFrom: theme.colors.surface,
                                backgroundGradientTo: theme.colors.surface,
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                style: {
                                    borderRadius: 16
                                },
                                propsForDots: {
                                    r: "6",
                                    strokeWidth: "2",
                                    stroke: theme.colors.primary
                                }
                            }}
                            bezier
                            style={{
                                marginVertical: 8,
                                borderRadius: 16
                            }}
                        />
                    ) : (
                        <Text style={{ padding: 20, color: theme.colors.text.secondary }}>No price data available</Text>
                    )}
                </View>

                {/* Quick Actions */}
                <View style={styles.actionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('quick_actions')}</Text>
                    </View>

                    <TouchableOpacity style={[styles.actionButton, isDesktop && styles.actionButtonDesktop]} onPress={() => navigation.navigate('CropListing')}>
                        <View style={[styles.actionIcon, { backgroundColor: theme.colors.primary }]}>
                            <Ionicons name="add" size={24} color="#fff" />
                        </View>
                        <View style={styles.actionTextContainer}>
                            <View style={styles.actionTitleRow}>
                                <Text style={styles.actionTitle}>{t('list_new_crop') || 'List New Crop'}</Text>
                                <Tooltip text={safeStr(t('list_new_crop_tooltip')) || 'Create a new listing to sell your crops.'} iconSize={14} />
                            </View>
                            <Text style={styles.actionDesc}>{t('list_crop_desc')}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.disabled} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, isDesktop && styles.actionButtonDesktop]} onPress={() => navigation.navigate('Prices')}>
                        <View style={[styles.actionIcon, { backgroundColor: '#1976d2' }]}>
                            <Ionicons name="bar-chart" size={24} color="#fff" />
                        </View>
                        <View style={styles.actionTextContainer}>
                            <View style={styles.actionTitleRow}>
                                <Text style={styles.actionTitle}>{t('check_prices') || 'Check Prices'}</Text>
                                <Tooltip text={safeStr(t('check_prices_tooltip')) || 'View current market prices and trends for different crops.'} iconSize={14} />
                            </View>
                            <Text style={styles.actionDesc}>{t('check_prices_desc')}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.disabled} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, isDesktop && styles.actionButtonDesktop]} onPress={() => navigation.navigate('TransactionHistory')}>
                        <View style={[styles.actionIcon, { backgroundColor: theme.colors.success }]}>
                            <Ionicons name="wallet" size={24} color="#fff" />
                        </View>
                        <View style={styles.actionTextContainer}>
                            <View style={styles.actionTitleRow}>
                                <Text style={styles.actionTitle}>{t('earnings') || 'Earnings & History'}</Text>
                                <Tooltip text={safeStr(t('earnings_history_tooltip')) || 'View all your completed sales and track earnings over time.'} iconSize={14} />
                            </View>
                            <Text style={styles.actionDesc}>{t('earnings_desc') || 'View historical transaction data'}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.disabled} />
                    </TouchableOpacity>

                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50, // For status bar
        paddingBottom: 20,
        backgroundColor: theme.colors.surface,
        borderBottomLeftRadius: theme.borderRadius.l,
        borderBottomRightRadius: theme.borderRadius.l,
        ...theme.shadows.medium,
        zIndex: 10
    },
    headerLeft: {
        flex: 1
    },
    greetingSubtitle: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginBottom: 2
    },
    greetingTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.primary
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    languageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#f1f8e9', // Light green background
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#c8e6c9'
    },
    languageButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.primary
    },
    profileButton: {
        ...theme.shadows.small
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.surface
    },
    avatarText: {
        color: theme.colors.text.light,
        fontWeight: 'bold',
        fontSize: 18
    },
    content: {
        flex: 1,
        paddingTop: 20
    },
    contentContainerDesktop: {
        alignItems: 'center',
    },
    weatherCard: {
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: theme.borderRadius.l,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...theme.shadows.medium
    },
    weatherTemp: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.text.light
    },
    weatherCondition: {
        fontSize: 16,
        color: '#e8f5e9',
        marginBottom: 5
    },
    weatherLocation: {
        fontSize: 12,
        color: '#c8e6c9',
        flexDirection: 'row',
        alignItems: 'center'
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 15,
        justifyContent: 'space-between',
        maxWidth: 800,
        width: '100%'
    },
    statCard: {
        width: '48%',
        backgroundColor: theme.colors.surface,
        padding: 15,
        borderRadius: theme.borderRadius.m,
        marginBottom: 15,
        alignItems: 'center',
        ...theme.shadows.small,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    statCardDesktop: {
        width: '23%',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 2
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        textAlign: 'center'
    },
    statLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    chartContainer: {
        alignItems: 'center',
        marginVertical: 10,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        padding: 10,
        marginHorizontal: 20,
        width: 'auto',
        maxWidth: 800,
        ...theme.shadows.small
    },
    chartContainerDesktop: {
        width: 800,
    },
    actionContainer: {
        paddingHorizontal: 20,
        width: '100%',
        maxWidth: 800
    },
    sectionHeader: {
        marginBottom: 15,
        width: '100%',
        maxWidth: 800
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: 15,
        borderRadius: theme.borderRadius.m,
        marginBottom: 12,
        ...theme.shadows.small,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    actionButtonDesktop: {

    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    actionTextContainer: {
        flex: 1
    },
    actionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 2
    },
    actionDesc: {
        fontSize: 13,
        color: theme.colors.text.secondary
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        width: '85%',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: 20,
        ...theme.shadows.large
    },
    modalContentDesktop: {
        width: 400
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text.primary
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border
    },
    languageOptionActive: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.s,
        paddingHorizontal: 10,
        borderBottomWidth: 0
    },
    languageFlag: {
        fontSize: 24,
        marginRight: 15
    },
    languageLabel: {
        fontSize: 16,
        color: theme.colors.text.primary,
        flex: 1
    },
    languageLabelActive: {
        fontWeight: 'bold',
        color: theme.colors.primary
    }
});

export default FarmerDashboard;
