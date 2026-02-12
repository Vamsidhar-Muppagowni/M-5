import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import { theme } from '../../styles/theme';

const AIInsightsScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [marketInsights, setMarketInsights] = useState(null);
    const [cropRecommendations, setCropRecommendations] = useState([]);

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        console.log('🤖 AI Insights - Starting to fetch...');
        setLoading(true);

        try {
            // Fetch market insights
            console.log('📤 Fetching market insights...');
            const insightsRes = await api.post('/ml/insights', {
                crop: 'Wheat',
                location: 'North'
            });
            console.log('✅ Market insights received:', insightsRes.data);
            setMarketInsights(insightsRes.data);

            // Fetch crop recommendations
            console.log('📤 Fetching crop recommendations...');
            const recsRes = await api.post('/ml/recommend-crop', {
                location: 'North',
                soil_type: 'Loamy',
                water_source: 'irrigation',
                season: 'Kharif'
            });
            console.log('✅ Crop recommendations received:', recsRes.data);
            setCropRecommendations(recsRes.data);

            console.log('🏁 AI Insights - All data loaded successfully');
        } catch (error) {
            console.error('❌ Failed to fetch AI insights:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            // Show error to user
            let errorMessage = 'Failed to load AI insights.';
            if (error.response?.status === 401) {
                errorMessage = 'Authentication required. Please log in again.';
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }

            // Set default data so UI doesn't break
            setMarketInsights({
                price_trend: 'stable',
                buyer_interest: 'medium',
                supply_level: 'medium',
                market_sentiment: 'neutral',
                best_time_to_sell: 'now'
            });
            setCropRecommendations([]);

            // Show alert
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchInsights();
        setRefreshing(false);
    };

    const renderInsightCard = (icon, title, value, color) => (
        <View style={styles.insightCard}>
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{title}</Text>
                <Text style={[styles.insightValue, { color }]}>{value}</Text>
            </View>
        </View>
    );

    const renderCropRecommendation = (crop, index) => (
        <View key={index} style={styles.cropCard}>
            <View style={styles.cropHeader}>
                <Text style={styles.cropName}>{crop.crop}</Text>
                <View style={[styles.suitabilityBadge, {
                    backgroundColor: crop.suitability === 'high' ? theme.colors.success + '20' : theme.colors.warning + '20'
                }]}>
                    <Text style={[styles.suitabilityText, {
                        color: crop.suitability === 'high' ? theme.colors.success : theme.colors.warning
                    }]}>
                        {t(crop.suitability)}
                    </Text>
                </View>
            </View>

            <View style={styles.cropDetails}>
                <View style={styles.detailRow}>
                    <Ionicons name="trending-up" size={16} color={theme.colors.text.secondary} />
                    <Text style={styles.detailText}>{t('profit_margin')}: {crop.profit_margin}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="water" size={16} color={theme.colors.text.secondary} />
                    <Text style={styles.detailText}>{t('water_requirement')}: {crop.water_requirement}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="time" size={16} color={theme.colors.text.secondary} />
                    <Text style={styles.detailText}>{t('duration')}: {crop.duration}</Text>
                </View>
            </View>

            {crop.price_prediction && (
                <View style={styles.predictionBox}>
                    <Text style={styles.predictionLabel}>{t('expected_price_30days')}</Text>
                    <Text style={styles.predictionValue}>
                        {crop.price_prediction.trend === 'up' ? '📈' : '📉'} {t(crop.price_prediction.trend)}
                    </Text>
                </View>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryDark]}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>🤖 {t('ai_insights')}</Text>
                        <View style={{ width: 24 }} />
                    </View>
                </LinearGradient>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>{t('analyzing_market')}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>🤖 AI Insights</Text>
                    <View style={{ width: 24 }} />
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
            >
                {/* Market Insights Section */}
                {marketInsights && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📊 {t('market_intelligence')}</Text>

                        <View style={styles.insightsGrid}>
                            {renderInsightCard(
                                'trending-up',
                                t('price_trend'),
                                t(marketInsights.price_trend),
                                marketInsights.price_trend === 'up' ? theme.colors.success : theme.colors.error
                            )}
                            {renderInsightCard(
                                'people',
                                t('buyer_interest'),
                                t(marketInsights.buyer_interest),
                                theme.colors.primary
                            )}
                            {renderInsightCard(
                                'cube',
                                t('supply_level'),
                                t(marketInsights.supply_level),
                                theme.colors.secondary
                            )}
                            {renderInsightCard(
                                'happy',
                                t('market_sentiment'),
                                t(marketInsights.market_sentiment.replace(' ', '_')),
                                theme.colors.success
                            )}
                        </View>

                        <View style={styles.recommendationCard}>
                            <Ionicons name="bulb" size={24} color={theme.colors.secondary} />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.recommendationTitle}>{t('best_time_to_sell')}</Text>
                                <Text style={styles.recommendationText}>
                                    {marketInsights.best_time_to_sell === 'now' ?
                                        '✅ ' + t('now_good_time') :
                                        '⏳ ' + t('wait_better_prices')}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Crop Recommendations Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🌾 {t('recommended_crops')}</Text>
                    <Text style={styles.sectionSubtitle}>{t('based_on_conditions')}</Text>

                    {cropRecommendations.map((crop, index) => renderCropRecommendation(crop, index))}

                    {cropRecommendations.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>{t('no_recommendations')}</Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: theme.borderRadius.l,
        borderBottomRightRadius: theme.borderRadius.l,
        ...theme.shadows.medium
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff'
    },
    backButton: {
        padding: 5
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: theme.colors.text.secondary
    },
    content: {
        flex: 1,
        padding: 20
    },
    section: {
        marginBottom: 24
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 8
    },
    sectionSubtitle: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginBottom: 16
    },
    insightsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16
    },
    insightCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        padding: 16,
        ...theme.shadows.small
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12
    },
    insightContent: {
        gap: 4
    },
    insightTitle: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        textTransform: 'uppercase'
    },
    insightValue: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    recommendationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.secondary + '10',
        padding: 16,
        borderRadius: theme.borderRadius.l,
        ...theme.shadows.small
    },
    recommendationTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 4
    },
    recommendationText: {
        fontSize: 14,
        color: theme.colors.text.secondary
    },
    cropCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: 16,
        marginBottom: 12,
        ...theme.shadows.small
    },
    cropHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    cropName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary
    },
    suitabilityBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.s
    },
    suitabilityText: {
        fontSize: 12,
        fontWeight: 'bold'
    },
    cropDetails: {
        gap: 8,
        marginBottom: 12
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    detailText: {
        fontSize: 14,
        color: theme.colors.text.secondary
    },
    predictionBox: {
        backgroundColor: theme.colors.primary + '10',
        padding: 12,
        borderRadius: theme.borderRadius.m,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    predictionLabel: {
        fontSize: 12,
        color: theme.colors.text.secondary
    },
    predictionValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.primary
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center'
    },
    emptyText: {
        fontSize: 14,
        color: theme.colors.text.disabled
    }
});

export default AIInsightsScreen;
