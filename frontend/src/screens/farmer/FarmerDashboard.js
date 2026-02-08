import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, Image, StatusBar, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { changeLanguage } from '../../services/language';
import api, { marketAPI } from '../../services/api';
import * as Location from 'expo-location';
import { LineChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';

const FarmerDashboard = ({ navigation }) => {
    const { user } = useSelector(state => state.auth);
    const { t, i18n } = useTranslation();
    const [stats, setStats] = useState({
        activeListings: 0,
        totalSales: 0,
        pendingBids: 0,
        earnings: 0
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
                        if (address && address.length > 0) {
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

    const fetchStats = async () => {
        try {
            const response = await api.get('/farmer/stats');
            setStats(response.data);

            // Fetch Price History (Default: Wheat)
            setPriceLoading(true);
            try {
                const historyRes = await marketAPI.getPriceHistory({ crop: 'Wheat', location: 'India' });
                if (historyRes.data && historyRes.data.length > 0) {
                    // Process for chart: Take last 7 days
                    const last7 = historyRes.data.slice(-7);
                    setPriceHistory({
                        labels: last7.map(h => new Date(h.date).getDate().toString()), // Day of month
                        datasets: [{
                            data: last7.map(h => parseFloat(h.price))
                        }]
                    });
                } else {
                    // Fallback dummy data if empty
                    setPriceHistory({
                        labels: ["1", "2", "3", "4", "5", "6", "7"],
                        datasets: [{
                            data: [2200, 2250, 2300, 2280, 2350, 2400, 2450]
                        }]
                    });
                }
            } catch (chartErr) {
                console.warn("Chart fetch error", chartErr);
                // Fallback dummy data on error
                setPriceHistory({
                    labels: ["1", "2", "3", "4", "5", "6", "7"],
                    datasets: [{
                        data: [2200, 2250, 2300, 2280, 2350, 2400, 2450]
                    }]
                });
            }
            setPriceLoading(false);
        } catch (error) {
            console.error(error);
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
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Professional Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.greetingSubtitle}>{t('welcome_greeting')},</Text>
                    <Text style={styles.greetingTitle}>{user?.name?.split(' ')[0] || 'Farmer'}!</Text>
                </View>

                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.languageButton} onPress={() => setModalVisible(true)}>
                        <Text style={styles.languageButtonText}>{i18n.language.toUpperCase()}</Text>
                        <Ionicons name="chevron-down" size={16} color="#2e7d32" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</Text>
                        </View>
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
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Language</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#666" />
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
                                    <Ionicons name="checkmark-circle" size={24} color="#2e7d32" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            <ScrollView 
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Weather/Status Card */}
                <View style={[styles.weatherCard, { backgroundColor: '#2e7d32' }]}>
                    <View>
                        <Text style={styles.weatherTemp}>{weather.temp}</Text>
                        <Text style={styles.weatherCondition}>{t(weather.conditionKey)}</Text>
                        <Text style={styles.weatherLocation}>
                            <Ionicons name="location" size={14} color="#fff" /> {weather.location}
                        </Text>
                    </View>
                    <Ionicons name={weather.icon} size={48} color={weather.color} />
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('MyCrops')}>
                        <View style={[styles.iconContainer, { backgroundColor: '#e8f5e9' }]}>
                            <Ionicons name="leaf" size={24} color="#2e7d32" />
                        </View>
                        <Text style={styles.statValue}>{stats.activeListings}</Text>
                        <Text style={styles.statLabel}>{t('active_listings')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.statCard}>
                        <View style={[styles.iconContainer, { backgroundColor: '#fff3e0' }]}>
                            <Ionicons name="cash" size={24} color="#ef6c00" />
                        </View>
                        <Text style={styles.statValue}>₹{stats.earnings}</Text>
                        <Text style={styles.statLabel}>{t('total_earnings')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('PendingBids')}>
                        <View style={[styles.iconContainer, { backgroundColor: '#e3f2fd' }]}>
                            <Ionicons name="time" size={24} color="#1565c0" />
                        </View>
                        <Text style={styles.statValue}>{stats.pendingBids}</Text>
                        <Text style={styles.statLabel}>{t('pending_bids')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.statCard}>
                        <View style={[styles.iconContainer, { backgroundColor: '#f3e5f5' }]}>
                            <Ionicons name="checkmark-circle" size={24} color="#7b1fa2" />
                        </View>
                        <Text style={styles.statValue}>{stats.totalSales}</Text>
                        <Text style={styles.statLabel}>{t('completed_sales')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Market Trends Chart (NEW) */}
                <View style={[styles.sectionHeader, { paddingHorizontal: 20, marginTop: 10 }]}>
                    <Text style={styles.sectionTitle}>{t('market_trends') || 'Market Trends'} (Wheat)</Text>
                </View>

                <View style={styles.chartContainer}>
                    {priceLoading ? (
                        <Text style={{ padding: 20 }}>Loading Chart...</Text>
                    ) : priceHistory ? (
                        <LineChart
                            data={{
                                labels: priceHistory.labels,
                                datasets: priceHistory.datasets
                            }}
                            width={Dimensions.get('window').width - 60}
                            height={220}
                            yAxisLabel="Rs"
                            yAxisInterval={1}
                            chartConfig={{
                                backgroundColor: "#ffffff",
                                backgroundGradientFrom: "#ffffff",
                                backgroundGradientTo: "#ffffff",
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                style: {
                                    borderRadius: 16
                                },
                                propsForDots: {
                                    r: "6",
                                    strokeWidth: "2",
                                    stroke: "#2e7d32"
                                }
                            }}
                            bezier
                            style={{
                                marginVertical: 8,
                                borderRadius: 16
                            }}
                        />
                    ) : (
                        <Text style={{ padding: 20, color: '#666' }}>No price data available</Text>
                    )}
                </View>

                {/* Quick Actions */}
                <View style={styles.actionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('quick_actions')}</Text>
                    </View>

                    <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('CropListing')}>
                        <View style={[styles.actionIcon, { backgroundColor: '#2e7d32' }]}>
                            <Ionicons name="add" size={24} color="#fff" />
                        </View>
                        <View style={styles.actionTextContainer}>
                            <Text style={styles.actionTitle}>{t('list_new_crop')}</Text>
                            <Text style={styles.actionDesc}>{t('list_crop_desc')}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Prices')}>
                        <View style={[styles.actionIcon, { backgroundColor: '#1976d2' }]}>
                            <Ionicons name="bar-chart" size={24} color="#fff" />
                        </View>
                        <View style={styles.actionTextContainer}>
                            <Text style={styles.actionTitle}>{t('check_prices')}</Text>
                            <Text style={styles.actionDesc}>{t('check_prices_desc')}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('VoiceAssistant')}>
                        <View style={[styles.actionIcon, { backgroundColor: '#f57c00' }]}>
                            <Ionicons name="mic" size={24} color="#fff" />
                        </View>
                        <View style={styles.actionTextContainer}>
                            <Text style={styles.actionTitle}>{t('voice_assistant')}</Text>
                            <Text style={styles.actionDesc}>{t('voice_assistant_desc')}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
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
        backgroundColor: '#f8f9fa'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50, // For status bar
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        zIndex: 10
    },
    headerLeft: {
        flex: 1
    },
    greetingSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2
    },
    greetingTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2e7d32'
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
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
        color: '#2e7d32'
    },
    profileButton: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2e7d32',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff'
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18
    },
    content: {
        flex: 1,
        paddingTop: 20
    },
    weatherCard: {
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: '#2e7d32',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#2e7d32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5
    },
    weatherTemp: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff'
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
        justifyContent: 'space-between'
    },
    statCard: {
        width: '48%',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 16,
        marginBottom: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f0f0f0'
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
        color: '#333',
        marginBottom: 2
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center'
    },
    chartContainer: {
        alignItems: 'center',
        marginVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 10,
        marginHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2
    },
    actionContainer: {
        paddingHorizontal: 20
    },
    sectionHeader: {
        marginBottom: 15
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f0f0f0'
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
    actionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2
    },
    actionDesc: {
        fontSize: 13,
        color: '#888'
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
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10
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
        color: '#333'
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    languageOptionActive: {
        backgroundColor: '#f0f9f0',
        borderRadius: 10,
        paddingHorizontal: 10,
        borderBottomWidth: 0
    },
    languageFlag: {
        fontSize: 24,
        marginRight: 15
    },
    languageLabel: {
        fontSize: 16,
        color: '#333',
        flex: 1
    },
    languageLabelActive: {
        fontWeight: 'bold',
        color: '#2e7d32'
    }
});

export default FarmerDashboard;