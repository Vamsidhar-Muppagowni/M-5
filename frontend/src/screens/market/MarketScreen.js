import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCrops } from '../../store/slices/marketSlice';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { theme } from '../../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';

const MarketScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { crops, isLoading, pagination } = useSelector(state => state.market);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        loadCrops();
    }, [page]);

    // Safety check: Reset page if out of bounds
    useEffect(() => {
        if (!isLoading && pagination?.totalPages > 0 && page > pagination.totalPages) {
            setPage(1);
        }
    }, [pagination, page, isLoading]);

    const loadCrops = () => {
        dispatch(fetchCrops({ page, search }));
    };

    const onRefresh = () => {
        setPage(1);
        loadCrops();
    };

    const handleNavigateToDetails = (item) => {
        navigation.navigate('CropDetails', { id: item.id || item._id });
    };

    const renderItem = ({ item }) => {
        if (!item) return null;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => handleNavigateToDetails(item)}
                activeOpacity={0.9}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.iconPlaceholder}>
                        <Text style={styles.iconText}>{item?.name?.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.headerContent}>
                        <Text style={styles.cropName}>{item?.name || 'Unknown Crop'}</Text>
                        <Text style={styles.farmerName}>{t('by')}: {item?.farmer?.name || 'Unknown'}</Text>
                    </View>
                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>₹{item?.current_price || item?.min_price}</Text>
                        <Text style={styles.unit}>/{item?.unit}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.cardBody}>
                    <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={16} color={theme.colors.text.secondary} />
                        <Text style={styles.detailText}>{item?.location?.district || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="ribbon-outline" size={16} color={theme.colors.text.secondary} />
                        <Text style={styles.detailText}>{t('grade')} {item?.quality_grade}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="scale-outline" size={16} color={theme.colors.text.secondary} />
                        <Text style={styles.detailText}>{item?.quantity} {item?.unit}</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: item?.status === 'listed' ? theme.colors.success + '20' : theme.colors.secondary + '20' }]}>
                        <Text style={[styles.statusText, { color: item?.status === 'listed' ? theme.colors.success : theme.colors.secondary }]}>
                            {item?.status?.toUpperCase()}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.detailsButton} onPress={() => handleNavigateToDetails(item)}>
                        <Text style={styles.detailsButtonText}>{t('details')}</Text>
                        <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => {
        if (isLoading) return null; // Loader handles it
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color={theme.colors.text.disabled} />
                <Text style={styles.emptyText}>{t('no_crops_found')}</Text>
                <Text style={styles.emptySubText}>{t('try_adjusting_search')}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.header}
            >
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={theme.colors.text.secondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('search_placeholder')}
                        value={search}
                        onChangeText={setSearch}
                        onSubmitEditing={() => { setPage(1); loadCrops(); }}
                        placeholderTextColor={theme.colors.text.disabled}
                    />
                </View>
            </LinearGradient>

            {isLoading && page === 1 && !crops?.length ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loaderText}>{t('loading_market')}</Text>
                </View>
            ) : (
                <FlatList
                    data={crops || []}
                    keyExtractor={(item) => item?.id?.toString() || item?._id?.toString() || Math.random().toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshing={isLoading}
                    onRefresh={onRefresh}
                    onEndReached={() => {
                        if (pagination && page < pagination.totalPages) {
                            setPage(p => p + 1);
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={renderEmpty}
                    showsVerticalScrollIndicator={false}
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
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: theme.borderRadius.l,
        borderBottomRightRadius: theme.borderRadius.l,
        ...theme.shadows.medium
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        paddingHorizontal: 15,
        height: 50,
        ...theme.shadows.small
    },
    searchIcon: {
        marginRight: 10
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.text.primary,
        height: '100%'
    },
    list: {
        padding: 20,
        paddingBottom: 40
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        marginBottom: 16,
        padding: 16,
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
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    iconText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.primary
    },
    headerContent: {
        flex: 1
    },
    cropName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary
    },
    farmerName: {
        fontSize: 12,
        color: theme.colors.text.secondary
    },
    priceContainer: {
        alignItems: 'flex-end'
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.primary
    },
    unit: {
        fontSize: 12,
        color: theme.colors.text.secondary
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginBottom: 12
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        flexWrap: 'wrap'
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
        marginBottom: 5
    },
    detailText: {
        fontSize: 13,
        color: theme.colors.text.secondary,
        marginLeft: 4
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4
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
    detailsButton: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    detailsButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
        marginRight: 4
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loaderText: {
        marginTop: 10,
        color: theme.colors.text.secondary
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

export default MarketScreen;
