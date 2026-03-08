import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { trustAPI } from '../../services/api';
import { theme } from '../../styles/theme';
import RateUserModal from './RateUserModal';

const TransactionHistoryScreen = ({ navigation }) => {
    const { user } = useSelector(state => state.auth);
    const { t } = useTranslation();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [rateModalVisible, setRateModalVisible] = useState(false);
    const [targetUserId, setTargetUserId] = useState(null);
    const [activeTxId, setActiveTxId] = useState(null);

    const isFarmer = user?.role === 'farmer';

    const fetchTransactions = async () => {
        try {
            const response = await trustAPI.getTransactionHistory();
            setTransactions(response.data.transactions || []);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchTransactions();
        setRefreshing(false);
    };

    const openRateModal = (tx) => {
        // If user is buyer, rate the farmer. If user is farmer, rate the buyer.
        const targetId = isFarmer ? tx.buyer?._id : tx.farmer?._id;
        setActiveTxId(tx._id);
        setTargetUserId(targetId);
        setRateModalVisible(true);
    };

    const renderTransaction = ({ item }) => {
        const counterpartName = isFarmer ? item.buyer?.name : item.farmer?.name;
        const counterpartRole = isFarmer ? t('buyer') : t('farmer');
        const roleString = counterpartRole || (isFarmer ? 'Buyer' : 'Farmer');

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.iconPlaceholder}>
                        <Ionicons name="receipt-outline" size={20} color={theme.colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cropName}>{item.crop?.name || 'Crop Transaction'}</Text>
                        <Text style={styles.counterpartText}>{roleString}: {counterpartName || 'Unknown'}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: theme.colors.success + '20' }]}>
                        <Text style={[styles.statusText, { color: theme.colors.success }]}>
                            {t('completed') || 'COMPLETED'}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <Ionicons name="cash-outline" size={16} color={theme.colors.text.secondary} />
                        <Text style={styles.detailLabel}>{t('amount') || 'Amount:'}</Text>
                        <Text style={styles.detailValue}>₹{item.amount}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={16} color={theme.colors.text.secondary} />
                        <Text style={styles.detailLabel}>{t('date') || 'Date:'}</Text>
                        <Text style={styles.detailValue}>{new Date(item.created_at).toLocaleDateString()}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.rateButton}
                    onPress={() => openRateModal(item)}
                >
                    <Text style={styles.rateButtonText}>⭐ {t('leave_review') || 'Leave a Review'}</Text>
                </TouchableOpacity>
            </View>
        );
    };

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
                <Text style={styles.title}>{t('transaction_history') || 'Transaction History'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={transactions}
                renderItem={renderTransaction}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="wallet-outline" size={64} color={theme.colors.text.disabled} />
                        <Text style={styles.emptyText}>{t('no_transactions') || 'No transactions yet.'}</Text>
                        <Text style={styles.emptySubText}>{t('completed_trades_appear_here') || 'Your completed trades will appear here.'}</Text>
                    </View>
                }
            />

            {targetUserId && (
                <RateUserModal
                    visible={rateModalVisible}
                    onClose={() => setRateModalVisible(false)}
                    targetUserId={targetUserId}
                    transactionId={activeTxId}
                />
            )}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    list: {
        padding: 20
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        padding: 16,
        marginBottom: 16,
        ...theme.shadows.small,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    iconPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    cropName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.primary
    },
    counterpartText: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        marginTop: 2
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
    detailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16
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
        fontWeight: 'bold',
        color: theme.colors.text.primary
    },
    rateButton: {
        backgroundColor: theme.colors.primary + '15',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center'
    },
    rateButtonText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: 14
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

export default TransactionHistoryScreen;
