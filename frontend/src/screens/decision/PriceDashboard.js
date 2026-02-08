import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import api from '../../services/api';

const PriceDashboard = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [crops, setCrops] = useState([]);
    const [selectedCrop, setSelectedCrop] = useState('');
    const [priceData, setPriceData] = useState({
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
            {
                data: [0, 0, 0, 0, 0, 0],
                color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`, // Green #2E7D32
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

            if (cropList.length > 0) {
                setSelectedCrop(cropList[0].name);
            } else {
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
                <Text style={styles.insightText}>
                    {isUp ? "📈" : "📉"} {isUp ? "Upward" : "Downward"} trend in last month
                    <Text style={{ fontWeight: 'bold', color: isUp ? '#2e7d32' : '#c62828' }}>
                        {' '}({isUp ? '+' : ''}{percent}%)
                    </Text>
                </Text>
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

        let trendText = "➖ Stable trend over last 6 months";
        let trendColor = "#555"; // Grey for stable

        if (percent > 2) {
            trendText = "📈 Upward trend over last 6 months";
            trendColor = "#2e7d32"; // Green
        } else if (percent < -2) {
            trendText = "📉 Downward trend over last 6 months";
            trendColor = "#c62828"; // Red
        }

        return (
            <View style={[styles.insightContainer, { marginTop: 10 }]}>
                <Text style={[styles.insightText, { fontWeight: 'bold', fontSize: 15 }]}>
                    {trendText}
                </Text>
                <Text style={{ fontSize: 14, color: trendColor, marginTop: 4, fontWeight: '600' }}>
                    Overall Change: {diff > 0 ? '+' : ''}{percentStr}%
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
        <ScrollView style={styles.container} onTouchStart={handleChartPress}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.header}>Market Price Trends</Text>
            </View>

            <View style={styles.pickerContainer}>
                <Text style={styles.label}>Select Crop:</Text>
                <View style={styles.pickerWrapper}>
                    <Picker
                        selectedValue={selectedCrop}
                        onValueChange={(itemValue) => setSelectedCrop(itemValue)}
                        style={styles.picker}
                    >
                        {crops.map((crop) => (
                            <Picker.Item key={crop.id} label={crop.name} value={crop.name} />
                        ))}
                    </Picker>
                </View>
            </View>

            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>{selectedCrop} Price Analysis (Last 6 Months)</Text>
                {loading ? (
                    <ActivityIndicator size="large" color="#2e7d32" style={{ margin: 50 }} />
                ) : (
                    <LineChart
                        data={priceData}
                        width={Dimensions.get("window").width - 30}
                        height={240}
                        yAxisLabel="₹"
                        yAxisSuffix=""
                        yAxisInterval={1}
                        chartConfig={{
                            backgroundColor: "#ffffff",
                            backgroundGradientFrom: "#ffffff",
                            backgroundGradientTo: "#e8f5e9", // Very light green gradient
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`, // Green #2E7D32
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${0.7})`,    // Dark text
                            style: {
                                borderRadius: 16
                            },
                            propsForDots: {
                                r: "5",         // Dot radius
                                strokeWidth: "2",
                                stroke: "#2e7d32" // Green dot border
                            }
                        }}
                        bezier
                        style={{
                            marginVertical: 15, // Improved spacing
                            borderRadius: 16,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 3 // Android shadow
                        }}
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
                                            left: tooltipPos.x - 30, // Centered better relative to point
                                            top: tooltipPos.y - 45, // Higher above point
                                            backgroundColor: '#1b5e20', // Dark green tooltip
                                            padding: 8,
                                            borderRadius: 8,
                                            zIndex: 100,
                                            alignItems: 'center'
                                        }}>
                                        <Text style={{ color: 'white', fontWeight: 'bold' }}>₹{parseFloat(tooltipPos.value).toFixed(2)}</Text>
                                        {/* Optional arrow indicator */}
                                        <View style={{
                                            position: 'absolute',
                                            bottom: -5,
                                            left: '42%',
                                            width: 0,
                                            height: 0,
                                            borderLeftWidth: 5,
                                            borderRightWidth: 5,
                                            borderTopWidth: 5,
                                            borderLeftColor: 'transparent',
                                            borderRightColor: 'transparent',
                                            borderTopColor: '#1b5e20'
                                        }} />
                                    </View>
                                </View>
                            ) : null;
                        }}
                    />
                )}
                {renderTrendInsight()}
                {renderSixMonthTrend()}
            </View>

            <Text style={styles.subHeader}>Recent Market Updates</Text>
            {recentPrices.map((item) => (
                <View key={item.id} style={styles.priceItem}>
                    <View>
                        <Text style={styles.cropName}>{item.crop}</Text>
                        <Text style={styles.date}>{item.date}</Text>
                    </View>
                    <Text style={styles.price}>₹{parseFloat(item.price).toFixed(2)}</Text>
                </View>
            ))}

            {recentPrices.length === 0 && (
                <Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>No recent updates available.</Text>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 15,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 10,
    },
    backButton: {
        marginRight: 15,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    pickerContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
        color: '#555',
    },
    pickerWrapper: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    chartContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    chartTitle: {
        fontSize: 16,
        marginBottom: 10,
        fontWeight: '600',
        color: '#555',
    },
    subHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
        marginTop: 10,
    },
    priceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
    },
    cropName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    date: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2e7d32',
    },
    insightContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 1,
        width: '100%',
        alignItems: 'center'
    },
    insightText: {
        fontSize: 14,
        color: '#555',
        fontWeight: '500'
    }
});

export default PriceDashboard;
