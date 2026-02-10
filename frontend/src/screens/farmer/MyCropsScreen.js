import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { marketAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';

const MyCropsScreen = ({ navigation }) => {
    const { user } = useSelector(state => state.auth);
    const { t } = useTranslation();
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchCrops = async () => {
        if (!user) return;
        try {
            const response = await marketAPI.getCrops({
                farmer_id: user.id,
                status: 'listed'
            });
            if (response.data.crops) {
                setCrops(response.data.crops);
            }
        } catch (error) {
            console.error("Fetch crops error:", error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchCrops();
        setRefreshing(false);
    }, []);

    // Use useFocusEffect to refresh crops when screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchCrops();
        }, [])
    );

    const handleDelete = (cropId) => {
        Alert.alert(
            t('delete_listing'),
            t('delete_confirm'),
            [{
                text: t('cancel'),
                style: "cancel"
            },
            {
                text: t('delete'),
                style: "destructive",
                onPress: async () => {
                    Alert.alert("Info", t('delete_soon'));
                }
            }
            ]
        );
    };

    const renderCropItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('CropDetails', { cropId: item.id })}
            activeOpacity={0.9}
        >
            <View style={styles.cardHeader}>
                <View style={styles.headerContent}>
                    <View style={styles.iconPlaceholder}>
                        <Text style={styles.iconText}>{item.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.titleContainer}>
                        <Text style={styles.cropName}>{item.name}</Text>
                        <Text style={styles.cropVariety}>{item.variety || 'Standard Variety'}</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'listed' ? '#e8f5e9' : '#fff3e0' }]}>
                    <Ionicons
                        name={item.status === 'listed' ? 'checkmark-circle' : 'time'}
                        size={12}
                        color={item.status === 'listed' ? theme.colors.success : theme.colors.secondary}
                        style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.statusText, { color: item.status === 'listed' ? theme.colors.success : theme.colors.secondary }]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBody}>
                <View style={styles.infoColumn}>
                    <View style={styles.infoRow}>
                        <Ionicons name="cube-outline" size={16} color={theme.colors.text.secondary} />
                        <Text style={styles.infoText}>{item.quantity} {item.unit}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="pricetag-outline" size={16} color={theme.colors.text.secondary} />
                        <Text style={styles.infoText}>₹{item.min_price}/{item.unit}</Text>
                    </View>
                </View>
                <View style={styles.infoColumn}>
                    <View style={styles.infoRow}>
                        <Ionicons name="eye-outline" size={16} color={theme.colors.text.secondary} />
                        <Text style={styles.infoText}>{item.view_count || 0} {t('views')}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="hammer-outline" size={16} color={theme.colors.text.secondary} />
                        <Text style={styles.infoText}>{item.bid_count || 0} {t('bids')}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.dateText}>{t('listed_date')} {new Date(item.created_at).toLocaleDateString()}</Text>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.id || item._id)}>
                    <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>{t('my_active_listings')}</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('CropListing')}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                        style={styles.addButtonGradient}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ marginTop: 10, color: theme.colors.text.secondary }}>{t('loading_market')}</Text>
                </View>
            ) : (
                <FlatList
                    data={crops}
                    renderItem={renderCropItem}
                    keyExtractor={item => item.id || item._id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[theme.colors.primary]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconContainer}>
                                <Ionicons name="leaf-outline" size={64} color={theme.colors.text.disabled} />
                            </View>
                            <Text style={styles.emptyTitle}>{t('no_active_listings')}</Text>
                            <Text style={styles.emptyText}>{t('no_active_listings_desc')}</Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('CropListing')}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                                    style={styles.primaryButton}
                                >
                                    <Text style={styles.primaryButtonText}>{t('list_first_crop')}</Text>
                                    <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
                                </LinearGradient>
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
        backgroundColor: theme.colors.background
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        ...theme.shadows.small
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.background
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.primary
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        ...theme.shadows.medium
    },
    addButtonGradient: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 20,
        paddingBottom: 40
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
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center'
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
    titleContainer: {
        justifyContent: 'center'
    },
    cropName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary
    },
    cropVariety: {
        fontSize: 13,
        color: theme.colors.text.secondary,
        marginTop: 2
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
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
        marginVertical: 10
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12
    },
    infoColumn: {
        flex: 1
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    infoText: {
        marginLeft: 8,
        fontSize: 14,
        color: theme.colors.text.primary,
        fontWeight: '500'
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4
    },
    dateText: {
        fontSize: 12,
        color: theme.colors.text.disabled,
        fontStyle: 'italic'
    },
    actionButton: {
        padding: 8,
        backgroundColor: '#ffebee',
        borderRadius: 8
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
        paddingHorizontal: 30
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 10
    },
    emptyText: {
        fontSize: 15,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22
    },
    primaryButton: {
        flexDirection: 'row',
        paddingHorizontal: 25,
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        ...theme.shadows.medium
    },
    primaryButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    }
});

export default MyCropsScreen;
