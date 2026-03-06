import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { marketAPI } from '../../services/api';
import { theme } from '../../styles/theme';

const CheckoutScreen = ({ route, navigation }) => {
    const { t } = useTranslation();
    const { bid } = route.params;

    const [paymentMethod, setPaymentMethod] = useState('online');
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    const [isExpired, setIsExpired] = useState(false);

    const amount = bid?.amount || 0;
    const crop = bid?.crop || {};
    const farmer = bid?.farmer || {};
    const paymentMethods = farmer?.farmerProfile?.payment_methods || {};

    useEffect(() => {
        if (!bid?.payment_expires_at) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const expiresAt = new Date(bid.payment_expires_at).getTime();
            const distance = expiresAt - now;

            if (distance < 0) {
                clearInterval(timer);
                setTimeLeft('00:00');
                setIsExpired(true);
            } else {
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [bid]);

    const handlePayment = async () => {
        setLoading(true);
        try {
            await marketAPI.checkoutBid({
                bid_id: bid._id,
                payment_method: paymentMethod
            });

            // If success, go back to My Bids or show success screen
            Alert.alert(
                t('success') || 'Success',
                t('payment_successful') || 'Transaction completed successfully!',
                [
                    { text: 'OK', onPress: () => navigation.popToTop() }
                ]
            );
        } catch (error) {
            console.error('Checkout error:', error);
            Alert.alert(
                t('error') || 'Error',
                error.response?.data?.error || t('checkout_failed') || 'Could not complete checkout.'
            );
        } finally {
            setLoading(false);
        }
    };

    const PaymentOption = ({ label, icon, selected, onSelect }) => (
        <TouchableOpacity
            style={[styles.methodCard, selected && styles.methodCardSelected]}
            onPress={onSelect}
        >
            <Ionicons name={icon} size={24} color={selected ? theme.colors.primary : theme.colors.text.secondary} />
            <Text style={[styles.methodText, selected && { color: theme.colors.primary }]}>{label}</Text>
            <View style={{ flex: 1 }} />
            {selected && <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />}
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>{t('checkout') || 'Checkout'}</Text>
            </View>

            <Text style={styles.detailsText}>
                <Text style={styles.label}>{t('crop')}: </Text>{crop?.name} (x{crop?.quantity} {crop?.unit || 'Quintals'}){"\n"}
                <Text style={styles.label}>{t('farmer')}: </Text>{crop?.farmer?.name || 'Farmer'}
            </Text>

            <View style={styles.divider} />

            {/* Timer Section */}
            {bid?.payment_expires_at && (
                <View style={[styles.timerContainer, isExpired && styles.timerExpired]}>
                    <Ionicons name="time-outline" size={24} color={isExpired ? theme.colors.error : theme.colors.warning} />
                    <Text style={[styles.timerText, isExpired && { color: theme.colors.error }]}>
                        {isExpired ? 'Payment Time Expired' : `Time remaining: ${timeLeft || '...'}`}
                    </Text>
                </View>
            )}

            <Text style={styles.sectionTitle}>{t('select_payment') || 'Select Payment Method'}</Text>

            <View style={styles.paymentMethods}>
                <PaymentOption
                    label={t('pay_now') || "Pay Now (Online)"}
                    icon="card-outline"
                    selected={paymentMethod === 'online'}
                    onSelect={() => setPaymentMethod('online')}
                />
                <PaymentOption
                    label={t('pay_later') || "Pay on Delivery"}
                    icon="cash-outline"
                    selected={paymentMethod === 'cod'}
                    onSelect={() => setPaymentMethod('cod')}
                />
            </View>

            {/* Farmer Payment Details */}
            {paymentMethod === 'online' && (
                <View style={styles.farmerPaymentDetails}>
                    <Text style={styles.detailsTitle}>Farmer's Payment Info:</Text>
                    {paymentMethods.upi_id ? (
                        <View style={styles.detailRow}>
                            <Ionicons name="phone-portrait-outline" size={18} color={theme.colors.text.secondary} />
                            <Text style={styles.detailText}>UPI: {paymentMethods.upi_id}</Text>
                        </View>
                    ) : null}

                    {paymentMethods.bank_account?.account_number ? (
                        <View style={styles.bankBox}>
                            <View style={styles.detailRow}>
                                <Ionicons name="business-outline" size={18} color={theme.colors.text.secondary} />
                                <Text style={styles.detailText}>Bank: {paymentMethods.bank_account.bank_name}</Text>
                            </View>
                            <Text style={styles.detailSubtext}>Acct Name: {paymentMethods.bank_account.account_holder_name}</Text>
                            <Text style={styles.detailSubtext}>Acct No: {paymentMethods.bank_account.account_number}</Text>
                            <Text style={styles.detailSubtext}>IFSC: {paymentMethods.bank_account.ifsc_code}</Text>
                        </View>
                    ) : null}

                    {!paymentMethods.upi_id && !paymentMethods.bank_account?.account_number && (
                        <Text style={styles.noInfoText}>Farmer has not provided online payment details.</Text>
                    )}
                </View>
            )}

            <View style={styles.summaryBox}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{t('crop_price') || 'Crop Price'}</Text>
                    <Text style={styles.summaryValue}>₹{amount}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{t('platform_fee') || 'Platform Fee'} (1%)</Text>
                    <Text style={styles.summaryValue}>₹{Math.round(amount * 0.01)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabelBold}>{t('total') || 'Total'}</Text>
                    <Text style={styles.summaryValueBold}>₹{Math.round(amount * 1.01)}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.payButton, (loading || isExpired) && styles.payButtonDisabled]}
                onPress={handlePayment}
                disabled={loading || isExpired}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.payButtonText}>{isExpired ? 'Expired' : (t('confirm_payment') || 'Confirm Payment')}</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
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
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        ...theme.shadows.small,
        zIndex: 10
    },
    backButton: { padding: 5 },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginLeft: 20
    },
    detailsText: {
        fontSize: 16,
        color: theme.colors.text.primary,
        marginHorizontal: 20,
        marginTop: 20,
        lineHeight: 24
    },
    label: {
        fontWeight: 'bold'
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: 20,
        marginHorizontal: 20
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginHorizontal: 20,
        marginBottom: 15
    },
    paymentMethods: {
        marginHorizontal: 20,
        marginBottom: 20
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        marginBottom: 10
    },
    methodCardSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primary + '10'
    },
    methodText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 15,
        color: theme.colors.text.primary
    },
    summaryBox: {
        backgroundColor: theme.colors.surface,
        marginHorizontal: 20,
        padding: 15,
        borderRadius: theme.borderRadius.m,
        ...theme.shadows.small,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    summaryLabel: { fontSize: 14, color: theme.colors.text.secondary },
    summaryValue: { fontSize: 14, color: theme.colors.text.primary },
    summaryLabelBold: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text.primary },
    summaryValueBold: { fontSize: 16, fontWeight: 'bold', color: theme.colors.primary },
    payButton: {
        backgroundColor: theme.colors.primary,
        marginHorizontal: 20,
        marginTop: 30,
        paddingVertical: 15,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
        ...theme.shadows.medium
    },
    payButtonDisabled: {
        backgroundColor: theme.colors.text.disabled
    },
    payButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff3e0',
        marginHorizontal: 20,
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ffe0b2'
    },
    timerExpired: {
        backgroundColor: '#ffebee',
        borderColor: '#ffcdd2'
    },
    timerText: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.warning
    },
    farmerPaymentDetails: {
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 15,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.small
    },
    detailsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 10
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5
    },
    detailText: {
        marginLeft: 8,
        fontSize: 14,
        color: theme.colors.text.primary,
        fontWeight: '500'
    },
    bankBox: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border
    },
    detailSubtext: {
        marginLeft: 26,
        fontSize: 13,
        color: theme.colors.text.secondary,
        marginBottom: 2
    },
    noInfoText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: theme.colors.text.disabled,
        textAlign: 'center',
        marginTop: 5
    }
});

export default CheckoutScreen;
