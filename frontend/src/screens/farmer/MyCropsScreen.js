import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { marketAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';

const MyCropsScreen = ({ navigation }) => {
    const { user } = useSelector(state => state.auth);
    const { t } = useTranslation();
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchCrops = async () => {
        try {
            // Assuming getCrops supports filtering by farmer_id or returns 'my-crops' correctly
            // The API route /my-crops seems to be the one to use based on routes/market.js
            const response = await marketAPI.getCrops({
                farmer_id: user.id, // Fallback if my-crops logic relies on token user
                status: 'listed' // Show listed crops
            });
            // The controller returns { crops: [...], pagination: {...} }
            // But verify if /my-crops is wired to marketController.getCrops which respects filters

            // If checking backend routes/market.js:
            // router.get('/my-crops', marketController.getCrops);
            // And marketController.getCrops checks query params.
            // But wait, the controller uses req.query.farmer_id. 
            // If I use the explicit /my-crops route, I might need to ensure the controller handles req.user correctly.
            // Looking at the code in marketController.js:
            /*
            exports.getCrops = async (req, res) => {
                const { farmer_id ... } = req.query;
                if (farmer_id) where.farmer_id = farmer_id;
            */
            // So if I call /market/crops?farmer_id=MyID it works. 

            // Actually, let's use the explicit route if available, or just filter.
            // Using generic getCrops with farmer_id filter is safer for now.

            // const response = await api.get('/market/my-crops'); // If this existed and worked perfectly

            if (response.data.crops) {
                setCrops(response.data.crops);
            }
        } catch (error) {
            console.error("Fetch crops error:", error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchCrops();
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchCrops();
    }, []);

    const renderCropItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('CropDetails', { cropId: item.id })}
        >
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.cropName}>{item.name}</Text>
                    <Text style={styles.cropVariety}>{item.variety || 'Standard Variety'}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'listed' ? '#e8f5e9' : '#fff3e0' }]}>
                    <Text style={[styles.statusText, { color: item.status === 'listed' ? '#2e7d32' : '#ef6c00' }]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Ionicons name="scale-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>{item.quantity} {item.unit}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="pricetag-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>₹{item.min_price}/{item.unit}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="eye-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>{item.view_count || 0} Views</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="hammer-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>{item.bid_count || 0} Bids</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.dateText}>
                    Listed on: {new Date(item.created_at).toLocaleDateString()}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>{t('active_listings')}</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('CropListing')}
                >
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <Text>Loading listings...</Text>
                </View>
            ) : (
                <FlatList
                    data={crops}
                    renderItem={renderCropItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="leaf-outline" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>No active listings found.</Text>
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={() => navigation.navigate('CropListing')}
                            >
                                <Text style={styles.primaryButtonText}>List Your First Crop</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    backButton: {
        padding: 8
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333'
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2e7d32',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2e7d32',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3
    },
    list: {
        padding: 20
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f0f0f0'
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12
    },
    cropName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
    },
    cropVariety: {
        fontSize: 14,
        color: '#666',
        marginTop: 2
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold'
    },
    cardBody: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
        marginBottom: 5,
        width: '45%'
    },
    infoText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#444'
    },
    cardFooter: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 10
    },
    dateText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right'
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
        marginBottom: 20
    },
    primaryButton: {
        backgroundColor: '#2e7d32',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25
    },
    primaryButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    }
});

export default MyCropsScreen;
