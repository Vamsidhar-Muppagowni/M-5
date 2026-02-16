import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import api, { BASE_URL } from '../../services/api';

const TransactionHistoryScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState('all'); // all, pending, completed

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.get(`${API_URL}/transactions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(response.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            // alert('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return theme.colors.success;
            case 'pending': return theme.colors.warning;
            case 'failed': return theme.colors.error;
            default: return theme.colors.text.secondary;
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const filteredTransactions = transactions.filter(txn => {
        if (filter === 'all') return true;
        return txn.payment_status === filter;
    });

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
        // onPress={() => navigation.navigate('TransactionDetails', { id: item._id })} // Future implementation
        >
            <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.payment_status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.payment_status) }]}>
                            {item.payment_status.toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
                </View>
                <Text style={styles.amountText}>₹{item.amount.toLocaleString()}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBody}>
                <View style={styles.cropInfo}>
                    <Text style={styles.cropName}>{item.crop?.name || 'Unknown Crop'}</Text>
                    <Text style={styles.partyName}>
                        {t('from')}: {item.farmer?.name || 'Unknown Farmer'}
                    </Text>
                </View>
                {item.crop?.images && item.crop.images.length > 0 && (
                    <Image source={{ uri: `${API_URL}${item.crop.images[0]}` }} style={styles.cropImage} />
                )}
            </View>

            {item.payment_status === 'completed' && (
                <View style={styles.footer}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                    <Text style={styles.footerText}>Paid via {item.payment_method}</Text>
                </View>
            )}
            {item.payment_status === 'pending' && (
                <View style={styles.footer}>
                    <Ionicons name="time" size={16} color={theme.colors.warning} />
                    <Text style={[styles.footerText, { color: theme.colors.warning }]}>Payment Pending</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('transaction_history')}</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.filterContainer}>
                {['all', 'pending', 'completed'].map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterChip, filter === f && styles.activeFilterChip]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>
                            {f.toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredTransactions}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="receipt-outline" size={64} color={theme.colors.text.disabled} />
                            <Text style={styles.emptyText}>No transactions found</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    filterContainer: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: theme.colors.surface,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.background,
        marginRight: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    activeFilterChip: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    filterText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.text.secondary,
    },
    activeFilterText: {
        color: '#FFFFFF',
    },
    listContainer: {
        padding: 15,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        marginBottom: 15,
        ...theme.shadows.small,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: theme.colors.surface,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: 10,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    dateText: {
        fontSize: 12,
        color: theme.colors.text.secondary,
    },
    amountText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginHorizontal: 15,
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    cropInfo: {
        flex: 1,
    },
    cropName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    partyName: {
        fontSize: 14,
        color: theme.colors.text.secondary,
    },
    cropImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginLeft: 10,
        backgroundColor: theme.colors.background,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingBottom: 15,
    },
    footerText: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        marginLeft: 6,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
        color: theme.colors.text.secondary,
    },
});

export default TransactionHistoryScreen;
