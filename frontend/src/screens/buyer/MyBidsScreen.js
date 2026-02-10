import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { theme } from '../../styles/theme';

const MyBidsScreen = ({ navigation }) => {
    const { user } = useSelector(state => state.auth);
    const { t } = useTranslation();
    const [bids, setBids] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchBids = async () => {
        try {
            const response = await api.get('/market/my-bids');
            setBids(response.data.bids || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchBids();
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchBids();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted': return theme.colors.success;
            case 'rejected': return theme.colors.error;
            default: return theme.colors.secondary;
        }
    };

    const renderBid = ({ item }) => (
        <TouchableOpacity
            style={styles.bidCard}
            activeOpacity={0.9}
        >
            <View style={styles.bidHeader}>
                <View style={styles.iconPlaceholder}>
                    <Text style={styles.iconText}>{item.crop?.name?.charAt(0).toUpperCase() || 'C'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.cropName}>{item.crop?.name}</Text>
                    <Text style={styles.farmerName}>{t('farmer_colon') || 'Farmer:'} {item.crop?.farmer?.name}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.bidDetails}>
                <View style={styles.detailRow}>
                    <Ionicons name="cash-outline" size={16} color={theme.colors.text.secondary} />
                    <Text style={styles.detailLabel}>{t('my_bid_label') || 'My Bid:'}</Text>
                    <Text style={styles.detailValue}>₹{item.amount}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color={theme.colors.text.secondary} />
                    <Text style={styles.detailLabel}>{t('date_label') || 'Date:'}</Text>
                    <Text style={styles.detailValue}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>{t('my_bids') || 'My Bids'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={bids}
                renderItem={renderBid}
                keyExtractor={item => (item.id || item._id || '').toString()}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="file-tray-outline" size={64} color={theme.colors.text.disabled} />
                            <Text style={styles.emptyText}>{t('no_bids_yet') || 'No bids placed yet.'}</Text>
                            <Text style={styles.emptySubText}>{t('start_bidding') || 'Start bidding on crops to see them here.'}</Text>
                        </View>
                    )
                }
            />
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        ...theme.shadows.small,
        zIndex: 10
    },
    backButton: {
        padding: 5
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text.primary
    },
    list: {
        padding: 20
    },
    bidCard: {
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: theme.borderRadius.m,
        marginBottom: 15,
        ...theme.shadows.small,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    bidHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    iconPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e3f2fd',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    iconText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.primary
    },
    cropName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.primary
    },
    farmerName: {
        fontSize: 12,
        color: theme.colors.text.secondary
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold'
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginBottom: 12
    },
    bidDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    detailLabel: {
        marginLeft: 6,
        marginRight: 4,
        fontSize: 14,
        color: theme.colors.text.secondary
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.primary
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.secondary,
        marginTop: 10
    },
    emptySubText: {
        fontSize: 14,
        color: theme.colors.text.disabled,
        marginTop: 5
    }
});

export default MyBidsScreen;
