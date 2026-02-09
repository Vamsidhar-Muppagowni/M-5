import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { marketAPI } from '../../services/api';
import { theme } from '../../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';
import SuccessModal from '../../components/SuccessModal';

const PendingBidsScreen = ({ navigation }) => {
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const fetchBids = async () => {
        try {
            const response = await marketAPI.getPendingBids();
            setBids(response.data.bids);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch bids');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBids();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchBids();
        setRefreshing(false);
    };

    const handleResponse = async (bidId, action) => {
        try {
            setProcessingId(bidId);
            await marketAPI.respondToBid({
                bid_id: bidId,
                action: action
            });

            setModalMessage(action === 'accept' ? 'Bid Accepted Successfully!' : 'Bid Rejected.');
            setSuccessModalVisible(true);

            // Remove from list locally for instant feedback
            setBids(prev => prev.filter(b => b.id !== bidId));

        } catch (error) {
            console.error(error);
            Alert.alert('Error', `Failed to ${action} bid`);
        } finally {
            setProcessingId(null);
        }
    };

    const renderBidItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.cropName}>{item.crop?.name || item.Crop?.name || 'Unknown Crop'}</Text>
                    <Text style={styles.buyerName}>Buyer: {item.buyer?.name || 'Unknown'}</Text>
                </View>
                <View style={styles.priceContainer}>
                    <Text style={styles.bidAmount}>₹{item.amount}</Text>
                    <Text style={styles.minPrice}>Min: ₹{item.crop?.min_price || item.Crop?.min_price}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsContainer}>
                <Text style={styles.quantity}>Qty: {item.crop?.quantity || item.Crop?.quantity || '--'} {item.crop?.unit || item.Crop?.unit}</Text>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleResponse(item.id, 'reject')}
                    disabled={processingId === item.id}
                >
                    <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                    <Text style={styles.rejectText}>Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleResponse(item.id, 'accept')}
                    disabled={processingId === item.id}
                >
                    {processingId === item.id ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                            <Text style={styles.acceptText}>Accept</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pending Bids</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={bids}
                renderItem={renderBidItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="documents-outline" size={64} color={theme.colors.text.disabled} />
                        <Text style={styles.emptyText}>No pending bids found</Text>
                    </View>
                }
            />

            <SuccessModal
                visible={successModalVisible}
                title="Success"
                message={modalMessage}
                onClose={() => setSuccessModalVisible(false)}
                buttonText="OK"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: theme.colors.surface,
        ...theme.shadows.small,
        zIndex: 10
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text.primary
    },
    listContent: {
        padding: 20
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        padding: 15,
        marginBottom: 15,
        ...theme.shadows.small,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    cropName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 4
    },
    buyerName: {
        fontSize: 14,
        color: theme.colors.text.secondary
    },
    priceContainer: {
        alignItems: 'flex-end'
    },
    bidAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.primary
    },
    minPrice: {
        fontSize: 12,
        color: theme.colors.text.secondary
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: 12
    },
    detailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15
    },
    quantity: {
        fontSize: 14,
        color: theme.colors.text.primary,
        fontWeight: '500'
    },
    date: {
        fontSize: 12,
        color: theme.colors.text.disabled
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: theme.borderRadius.s,
        borderWidth: 1
    },
    rejectButton: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2'
    },
    acceptButton: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primary
    },
    rejectText: {
        color: '#EF4444',
        fontWeight: 'bold',
        marginLeft: 5
    },
    acceptText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 5
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
        color: theme.colors.text.disabled
    }
});

export default PendingBidsScreen;
