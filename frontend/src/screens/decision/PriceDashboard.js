import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import api, { marketAPI } from '../../services/api';

const PriceDashboard = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [priceData, setPriceData] = useState({
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
            {
                data: [20, 45, 28, 80, 99, 43],
                color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
                strokeWidth: 2 // optional
            }
        ],
        legend: ["Wheat Prices"] // optional
    });

    // Mock data for list
    const [recentPrices, setRecentPrices] = useState([
        { id: '1', crop: 'Wheat', price: '2100', date: '2025-05-20' },
        { id: '2', crop: 'Rice', price: '3200', date: '2025-05-19' },
        { id: '3', crop: 'Cotton', price: '6500', date: '2025-05-18' },
    ]);

    useEffect(() => {
        // Future integration: 
        // fetchPrices();
    }, []);

    const fetchPrices = async () => {
        setLoading(true);
        try {
            // const res = await marketAPI.getPriceHistory({ crop: 'wheat' });
            // setPriceData(res.data);
        } catch (error) {
            console.error("Failed to fetch prices", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.header}>Market Price Trends</Text>
            </View>

            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Wheat Price Analysis (Last 6 Months)</Text>
                <LineChart
                    data={priceData}
                    width={Dimensions.get("window").width - 30} // from react-native
                    height={220}
                    yAxisLabel="₹"
                    yAxisSuffix="k"
                    yAxisInterval={1} // optional, defaults to 1
                    chartConfig={{
                        backgroundColor: "#e26a00",
                        backgroundGradientFrom: "#fb8c00",
                        backgroundGradientTo: "#ffa726",
                        decimalPlaces: 0, // optional, defaults to 2dp
                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        style: {
                            borderRadius: 16
                        },
                        propsForDots: {
                            r: "6",
                            strokeWidth: "2",
                            stroke: "#ffa726"
                        }
                    }}
                    bezier
                    style={{
                        marginVertical: 8,
                        borderRadius: 16
                    }}
                />
            </View>

            <Text style={styles.subHeader}>Recent Market Updates</Text>
            {recentPrices.map((item) => (
                <View key={item.id} style={styles.priceItem}>
                    <View>
                        <Text style={styles.cropName}>{item.crop}</Text>
                        <Text style={styles.date}>{item.date}</Text>
                    </View>
                    <Text style={styles.price}>₹{item.price}/q</Text>
                </View>
            ))}
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
        marginBottom: 20,
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
});

export default PriceDashboard;
