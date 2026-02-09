import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import api from '../../services/api';
import { theme } from '../../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';

const PriceDashboard = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [crops, setCrops] = useState([]);
    const [selectedCrop, setSelectedCrop] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [priceData, setPriceData] = useState({
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
            {
                data: [0, 0, 0, 0, 0, 0],
                color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
                strokeWidth: 2
            }
        ],
        legend: ["Loading..."]
    });

    const [recentPrices, setRecentPrices] = useState([]);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false, value: 0 });

    useEffect(() => {
        fetchCropsAndRecent();
    }, []);

    useEffect(() => {
        if (selectedCrop) {
            fetchPriceHistory(selectedCrop);
        }
    }, [selectedCrop]);

    const fetchCropsAndRecent = async () => {
        try {
            // Fetch crop list for dropdown
            const cropsRes = await api.get('/market/crops?page=1');
            const cropList = cropsRes.data.crops || [];
            setCrops(cropList);

            if (cropList.length > 0 && !selectedCrop) {
                setSelectedCrop(cropList[0].name);
            } else if (!selectedCrop) {
                setSelectedCrop('Wheat'); // Fallback
            }

            // Fetch recent updates
            const recentRes = await api.get('/market/prices/recent');
            setRecentPrices(recentRes.data);

        } catch (error) {
            console.error("Failed to fetch initial data", error);
        }
    };

    const fetchPriceHistory = async (cropName) => {
        setLoading(true);
        try {
            const res = await api.get(`/market/prices/history?crop=${cropName}`);
            setPriceData(res.data);
        } catch (error) {
            console.error("Failed to fetch prices", error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchCropsAndRecent();
        if (selectedCrop) {
            await fetchPriceHistory(selectedCrop);
        }
        setRefreshing(false);
    };

    const renderTrendInsight = () => {
        if (!priceData || !priceData.datasets || !priceData.datasets[0].data || priceData.datasets[0].data.length < 2) {
            return null;
        }

        const data = priceData.datasets[0].data;
        const lastPrice = data[data.length - 1];
        const prevPrice = data[data.length - 2];

        if (lastPrice === 0 || prevPrice === 0) return null; // data not ready

        const diff = lastPrice - prevPrice;
        const percent = ((diff / prevPrice) * 100).toFixed(1);

        const isUp = diff >= 0;

        return (
            <View style={styles.insightContainer}>
                <Ionicons name={isUp ? "trending-up" : "trending-down"} size={24} color={isUp ? theme.colors.success : theme.colors.error} />
                <Text style={styles.insightText}>
                    {isUp ? "Upward" : "Downward"} trend in last month
                </Text>
                <View style={[styles.percentBadge, { backgroundColor: isUp ? theme.colors.success + '20' : theme.colors.error + '20' }]}>
                    <Text style={{ fontWeight: 'bold', color: isUp ? theme.colors.success : theme.colors.error }}>
                        {isUp ? '+' : ''}{percent}%
                    </Text>
                </View>
            </View>
        );
    };

    const renderSixMonthTrend = () => {
        if (!priceData || !priceData.datasets || !priceData.datasets[0].data || priceData.datasets[0].data.length < 2) {
            return null;
        }

        const data = priceData.datasets[0].data;
        const firstPrice = data[0];
        const lastPrice = data[data.length - 1];

        if (firstPrice === 0 || lastPrice === 0) return null;

        const diff = lastPrice - firstPrice;
        const percent = ((diff / firstPrice) * 100);
        const percentStr = percent.toFixed(2);

        let trendText = "Stable trend";
        let trendColor = theme.colors.text.secondary;
        let iconName = "remove-circle-outline";

        if (percent > 2) {
            trendText = "Upward trend";
            trendColor = theme.colors.success;
            iconName = "trending-up";
        } else if (percent < -2) {
            trendText = "Downward trend";
            trendColor = theme.colors.error;
            iconName = "trending-down";
        }

        return (
            <View style={styles.insightCard}>
                <View style={[styles.insightIcon, { backgroundColor: trendColor + '20' }]}>
                    <Ionicons name={iconName} size={24} color={trendColor} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.insightTitle}>6-Month Analysis</Text>
                    <Text style={styles.insightSubtitle}>{trendText}</Text>
                </View>
                <Text style={[styles.insightValue, { color: trendColor }]}>
                    {diff > 0 ? '+' : ''}{percentStr}%
                </Text>
            </View>
        );
    };

    const handleChartPress = () => {
        if (tooltipPos.visible) {
            setTooltipPos((prev) => ({ ...prev, visible: false }));
        }
    };

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
                    <Text style={styles.headerTitle}>Market Price Trends</Text>
                    <View style={{ width: 24 }} />
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                onTouchStart={handleChartPress}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
            >
                <View style={styles.pickerContainer}>
                    <Text style={styles.label}>Select Crop</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={selectedCrop}
                            onValueChange={(itemValue) => setSelectedCrop(itemValue)}
                            style={styles.picker}
                            dropdownIconColor={theme.colors.primary}
                        >
                            {crops.map((crop) => (
                                <Picker.Item key={crop.id} label={crop.name} value={crop.name} />
                            ))}
                        </Picker>
                    </View>
                </View>

                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>{selectedCrop} Price Analysis</Text>
                    <Text style={styles.chartSubtitle}>Last 6 Months</Text>

                    {loading ? (
                        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
                    ) : (
                        <LineChart
                            data={priceData}
                            width={Dimensions.get("window").width - 40}
                            height={220}
                            yAxisLabel="₹"
                            yAxisSuffix=""
                            yAxisInterval={1}
                            chartConfig={{
                                backgroundColor: theme.colors.surface,
                                backgroundGradientFrom: theme.colors.surface,
                                backgroundGradientTo: theme.colors.surface,
                                decimalPlaces: 0,
                                color: (opacity = 1) => theme.colors.primary,
                                labelColor: (opacity = 1) => theme.colors.text.secondary,
                                style: {
                                    borderRadius: 16
                                },
                                propsForDots: {
                                    r: "4",
                                    strokeWidth: "2",
                                    stroke: theme.colors.secondary
                                }
                            }}
                            bezier
                            style={styles.chart}
                            onDataPointClick={(data) => {
                                const isSamePoint = (tooltipPos.x === data.x && tooltipPos.y === data.y);
                                isSamePoint ? setTooltipPos((prev) => ({ ...prev, visible: !prev.visible }))
                                    : setTooltipPos({ x: data.x, y: data.y, visible: true, value: data.value });
                            }}
                            decorator={() => {
                                return tooltipPos.visible ? (
                                    <View>
                                        <View
                                            style={{
                                                position: 'absolute',
                                                left: tooltipPos.x - 30,
                                                top: tooltipPos.y - 45,
                                                backgroundColor: theme.colors.primaryDark,
                                                padding: 8,
                                                borderRadius: 8,
                                                zIndex: 100,
                                                alignItems: 'center'
                                            }}>
                                            <Text style={{ color: 'white', fontWeight: 'bold' }}>₹{parseFloat(tooltipPos.value).toFixed(2)}</Text>
                                        </View>
                                    </View>
                                ) : null;
                            }}
                        />
                    )}
                    {renderTrendInsight()}
                </View>

                {renderSixMonthTrend()}

                <View style={styles.updatesSection}>
                    <Text style={styles.subHeader}>Recent Market Updates</Text>
                    {recentPrices.map((item) => (
                        <View key={item.id} style={styles.priceItem}>
                            <View style={styles.priceIconPlaceholder}>
                                <Text style={styles.priceIconText}>{item.crop.charAt(0)}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.cropName}>{item.crop}</Text>
                                <Text style={styles.date}>{item.date}</Text>
                            </View>
                            <Text style={styles.price}>₹{parseFloat(item.price).toFixed(0)}/q</Text>
                        </View>
                    ))}

                    {recentPrices.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No recent updates available.</Text>
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
    content: {
        flex: 1,
        padding: 20
    },
    pickerContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        color: theme.colors.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    pickerWrapper: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
        ...theme.shadows.small
    },
    picker: {
        height: 50,
        width: '100%',
    },
    chartContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: 16,
        marginBottom: 20,
        ...theme.shadows.small
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        textAlign: 'center'
    },
    chartSubtitle: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginBottom: 15
    },
    loader: {
        marginVertical: 50
    },
    chart: {
        marginVertical: 10,
        borderRadius: 16
    },
    insightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        padding: 10,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.m,
    },
    insightText: {
        fontSize: 14,
        color: theme.colors.text.primary,
        fontWeight: '500',
        marginLeft: 8,
        marginRight: 8
    },
    percentBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4
    },
    insightCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: theme.borderRadius.m,
        marginBottom: 24,
        ...theme.shadows.small
    },
    insightIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    insightTitle: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        textTransform: 'uppercase',
        marginBottom: 4
    },
    insightSubtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.primary
    },
    insightValue: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    updatesSection: {
        marginBottom: 20
    },
    subHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: theme.colors.text.primary,
    },
    priceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: theme.borderRadius.m,
        marginBottom: 10,
        ...theme.shadows.small,
    },
    priceIconPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.p20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    priceIconText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.primary
    },
    cropName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    date: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        marginTop: 2,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 20
    },
    emptyText: {
        color: theme.colors.text.disabled
    }
});

export default PriceDashboard;
