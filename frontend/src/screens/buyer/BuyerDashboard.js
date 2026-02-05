import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { changeLanguage } from '../../services/language';
import api from '../../services/api';

const { width } = Dimensions.get('window');

const BuyerDashboard = ({ navigation }) => {
    const { user } = useSelector(state => state.auth);
    const { t, i18n } = useTranslation();
    const [stats, setStats] = useState({
        activeBids: 0,
        acceptedBids: 0,
        pendingBids: 0
    });
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            // In a real app, this would be a dedicated stats endpoint
            const response = await api.get('/market/my-bids');
            const bids = response.data.bids || [];

            setStats({
                activeBids: bids.filter(b => b.status === 'pending').length,
                acceptedBids: bids.filter(b => b.status === 'accepted').length,
                pendingBids: bids.filter(b => b.status === 'pending').length
            });
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchStats();
    }, []);

    const QuickAction = ({ icon, title, color, onPress }) => (
        <TouchableOpacity style={[styles.actionCard, { backgroundColor: color }]} onPress={onPress}>
            <Ionicons name={icon} size={28} color="#fff" />
            <Text style={styles.actionText}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Header Section */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
                    <Text style={styles.subtitle}>Welcome back to the marketplace</Text>
                </View>
                <View style={styles.languageContainer}>
                    <Ionicons name="language" size={20} color="#2e7d32" style={{ marginRight: 5 }} />
                    <Picker
                        selectedValue={i18n.language}
                        style={styles.picker}
                        onValueChange={changeLanguage}
                        mode="dropdown"
                    >
                        <Picker.Item label="EN" value="en" />
                        <Picker.Item label="HI" value="hi" />
                        <Picker.Item label="TE" value="te" />
                    </Picker>
                </View>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <View style={[styles.iconBg, { backgroundColor: '#e3f2fd' }]}>
                        <Ionicons name="time" size={24} color="#1565c0" />
                    </View>
                    <Text style={styles.statValue}>{stats.activeBids}</Text>
                    <Text style={styles.statLabel}>Active Bids</Text>
                </View>
                <View style={styles.statCard}>
                    <View style={[styles.iconBg, { backgroundColor: '#e8f5e9' }]}>
                        <Ionicons name="checkmark-circle" size={24} color="#2e7d32" />
                    </View>
                    <Text style={styles.statValue}>{stats.acceptedBids}</Text>
                    <Text style={styles.statLabel}>Accepted</Text>
                </View>
            </View>

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
                <QuickAction
                    icon="search"
                    title="Browse Market"
                    color="#2e7d32"
                    onPress={() => navigation.navigate('Browse')}
                />
                <QuickAction
                    icon="trending-up"
                    title="Check Prices"
                    color="#f57c00"
                    onPress={() => navigation.navigate('Prices')}
                />
                <QuickAction
                    icon="mic"
                    title="Voice Helper"
                    color="#0288d1"
                    onPress={() => navigation.navigate('VoiceAssistant')}
                />
            </View>

            {/* Featured / Trending Section (Mock) */}
            <Text style={styles.sectionTitle}>Market Trends</Text>
            <View style={styles.trendCard}>
                <View style={styles.trendHeader}>
                    <Text style={styles.trendTitle}>Cotton</Text>
                    <Text style={styles.trendPrice}>₹6500/q</Text>
                </View>
                <Text style={styles.trendSubtitle}>Price up by 5% this week</Text>
                <View style={styles.trendFooter}>
                    <TouchableOpacity onPress={() => navigation.navigate('Prices')}>
                        <Text style={styles.trendLink}>View Chart →</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ height: 20 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa'
    },
    header: {
        padding: 20,
        paddingTop: 50,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a'
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 5
    },
    languageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingLeft: 10,
        height: 35,
        width: 110
    },
    picker: {
        width: 100,
        height: 35,
        color: '#333'
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 20,
        justifyContent: 'space-between'
    },
    statCard: {
        backgroundColor: '#fff',
        width: (width - 50) / 2,
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        elevation: 2
    },
    iconBg: {
        padding: 10,
        borderRadius: 50,
        marginBottom: 10
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333'
    },
    statLabel: {
        fontSize: 14,
        color: '#666'
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 20,
        marginBottom: 15,
        marginTop: 10
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 15,
        justifyContent: 'space-between'
    },
    actionCard: {
        width: (width - 45) / 2,
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
        // Make the last item span full width if odd number of items, usually handled by grid logic but simple here
        // For 3 items:
    },
    actionText: {
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 10,
        fontSize: 14
    },
    trendCard: {
        marginHorizontal: 20,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        elevation: 2,
        marginBottom: 10
    },
    trendHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    trendTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
    },
    trendPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2e7d32'
    },
    trendSubtitle: {
        color: '#666',
        marginTop: 5
    },
    trendFooter: {
        marginTop: 15,
        alignItems: 'flex-end'
    },
    trendLink: {
        color: '#1565c0',
        fontWeight: 'bold'
    }
});

export default BuyerDashboard;
