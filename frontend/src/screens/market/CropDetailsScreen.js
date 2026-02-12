import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { marketAPI } from '../../services/api';
import SuccessModal from '../../components/SuccessModal';
import { theme } from '../../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';

const CropDetailsScreen = ({ route, navigation }) => {
    const { id } = route.params;
    const { t } = useTranslation();
    const [crop, setCrop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState('');
    const [placingBid, setPlacingBid] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [lastBidAmount, setLastBidAmount] = useState('');
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        loadDetails();
    }, [id]);

    const loadDetails = async () => {
        try {
            setLoading(true);
            const response = await marketAPI.getCropDetails(id);
            setCrop(response.data.crop);
        } catch (error) {
            console.error(error);
            Alert.alert(t('crop_details') || 'Error', t('load_failed') || 'Failed to load details');
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceBid = async () => {
        if (!bidAmount || bidAmount.trim() === '') {
            Alert.alert(t('crop_details') || 'Error', t('enter_bid_error') || 'Enter bid amount');
            return;
        }

        const numericBid = parseFloat(bidAmount);
        if (isNaN(numericBid) || numericBid <= 0) {
            Alert.alert(t('crop_details') || 'Error', t('enter_bid_error') || 'Enter a valid bid amount');
            return;
        }

        if (crop && crop.min_price && numericBid < crop.min_price) {
            Alert.alert(
                t('crop_details') || 'Error',
                `Bid amount must be at least ₹${crop.min_price}`
            );
            return;
        }

        try {
            setPlacingBid(true);
            await marketAPI.placeBid({
                crop_id: id,
                amount: numericBid
            });
            setLastBidAmount(bidAmount);
            setBidAmount('');
            setSuccessModalVisible(true);
            loadDetails(); // Reload to see updated bid count
        } catch (error) {
            console.error(error);
            const errorMsg = error?.response?.data?.error || t('bid_failed') || 'Failed to place bid';
            Alert.alert(t('crop_details') || 'Error', errorMsg);
        } finally {
            setPlacingBid(false);
        }
    };

    if (loading) return (
        <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loaderText}>{t('loading') || 'Loading...'}</Text>
        </View>
    );

    if (!crop) return (
        <View style={styles.loaderContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={theme.colors.text.disabled} />
            <Text style={styles.emptyText}>{t('crop_not_found') || 'Crop not found'}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('crop_details') || 'Crop Details'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.titleCard}>
                    <View style={styles.iconPlaceholder}>
                        <Text style={styles.iconText}>{crop.name?.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.title}>{crop.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: crop.status === 'listed' ? theme.colors.success + '20' : theme.colors.secondary + '20' }]}>
                        <Text style={[styles.statusText, { color: crop.status === 'listed' ? theme.colors.success : theme.colors.secondary }]}>
                            {crop.status?.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.priceTag}>{t('current_price') || 'Current Price'}: ₹{crop.current_price}/{crop.unit}</Text>

                    <View style={styles.grid}>
                        <View style={styles.gridItem}>
                            <View style={styles.infoRow}>
                                <Ionicons name="cube-outline" size={16} color={theme.colors.text.secondary} />
                                <Text style={styles.label}>{t('quantity') || 'Quantity'}</Text>
                            </View>
                            <Text style={styles.value}>{crop.quantity} {crop.unit}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <View style={styles.infoRow}>
                                <Ionicons name="ribbon-outline" size={16} color={theme.colors.text.secondary} />
                                <Text style={styles.label}>{t('quality') || 'Quality'}</Text>
                            </View>
                            <Text style={styles.value}>{t('grade') || 'Grade'} {crop.quality_grade}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="leaf-outline" size={16} color={theme.colors.text.secondary} />
                        <Text style={styles.label}>{t('variety_label') || 'Variety'}</Text>
                    </View>
                    <Text style={styles.value}>{crop.variety || 'N/A'}</Text>

                    <View style={styles.infoRow}>
                        <Ionicons name="document-text-outline" size={16} color={theme.colors.text.secondary} />
                        <Text style={styles.label}>{t('description_label') || 'Description'}</Text>
                    </View>
                    <Text style={styles.value}>{crop.description || t('no_description') || 'No description available.'}</Text>

                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={16} color={theme.colors.text.secondary} />
                        <Text style={styles.label}>{t('location') || 'Location'}</Text>
                    </View>
                    <Text style={styles.value}>{crop.location?.district || 'N/A'}</Text>

                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={16} color={theme.colors.text.secondary} />
                        <Text style={styles.label}>{t('farmer_label') || 'Farmer'}</Text>
                    </View>
                    <Text style={styles.value}>{crop.farmer?.name || 'N/A'}</Text>
                </View>

                {user?.user_type === 'buyer' && crop.status === 'listed' && (
                    <View style={styles.bidSection}>
                        <View style={styles.bidHeader}>
                            <Ionicons name="cash-outline" size={20} color={theme.colors.primary} />
                            <Text style={styles.sectionTitle}>{t('place_a_bid') || 'Place a Bid'}</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder={`${t('enter_bid_error') || 'Enter amount'} (Min ₹${crop.min_price})`}
                            value={bidAmount}
                            onChangeText={setBidAmount}
                            keyboardType="numeric"
                            placeholderTextColor={theme.colors.text.disabled}
                        />
                        <TouchableOpacity
                            style={[styles.bidButton, placingBid && styles.bidButtonDisabled]}
                            onPress={handlePlaceBid}
                            disabled={placingBid}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={placingBid ? ['#ccc', '#aaa'] : [theme.colors.gradientStart, theme.colors.gradientEnd]}
                                style={styles.bidButtonGradient}
                            >
                                <Ionicons name={placingBid ? "hourglass-outline" : "hammer-outline"} size={20} color="#fff" />
                                <Text style={styles.bidButtonText}>
                                    {placingBid ? (t('placing_bid') || 'Placing Bid...') : (t('place_bid') || 'Place Bid')}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            <SuccessModal
                visible={successModalVisible}
                title={t('bid_placed') || 'Bid Placed!'}
                message={`${t('bid_placed_msg')?.replace('{amount}', lastBidAmount).replace('{crop}', crop.name) || `You successfully placed a bid of ₹${lastBidAmount} for ${crop.name}.`}`}
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
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background
    },
    loaderText: {
        marginTop: 10,
        color: theme.colors.text.secondary
    },
    emptyText: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        marginTop: 10
    },
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        ...theme.shadows.small,
        zIndex: 10
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.background
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text.primary
    },
    content: {
        flex: 1,
        padding: 20
    },
    titleCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: 20,
        alignItems: 'center',
        marginBottom: 16,
        ...theme.shadows.small,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    iconPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.p20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12
    },
    iconText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.primary
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 8
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold'
    },
    section: {
        backgroundColor: theme.colors.surface,
        padding: 20,
        borderRadius: theme.borderRadius.m,
        marginBottom: 16,
        ...theme.shadows.small,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    priceTag: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 15
    },
    grid: {
        flexDirection: 'row',
        marginBottom: 15
    },
    gridItem: {
        flex: 1
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 2
    },
    label: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginLeft: 6
    },
    value: {
        fontSize: 16,
        color: theme.colors.text.primary,
        fontWeight: '500',
        marginLeft: 22
    },
    bidSection: {
        backgroundColor: theme.colors.surface,
        padding: 20,
        borderRadius: theme.borderRadius.m,
        marginBottom: 20,
        ...theme.shadows.small,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    bidHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
        color: theme.colors.text.primary
    },
    input: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: 12,
        borderRadius: theme.borderRadius.m,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: theme.colors.background,
        color: theme.colors.text.primary
    },
    bidButton: {
        borderRadius: theme.borderRadius.m,
        overflow: 'hidden',
        ...theme.shadows.small
    },
    bidButtonDisabled: {
        opacity: 0.7
    },
    bidButtonGradient: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        borderRadius: theme.borderRadius.m
    },
    bidButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8
    }
});

export default CropDetailsScreen;
