import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import api from '../../services/api';

const PaymentScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { transaction } = route.params;
    const [selectedMethod, setSelectedMethod] = useState('upi');
    const [processing, setProcessing] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);

    const paymentMethods = [
        { id: 'upi', name: 'UPI', icon: 'phone-portrait-outline' },
        { id: 'card', name: 'Credit/Debit Card', icon: 'card-outline' },
        { id: 'bank_transfer', name: 'Net Banking', icon: 'globe-outline' },
        { id: 'cash', name: 'Cash on Delivery', icon: 'cash-outline' },
    ];

    const handlePayment = async () => {
        try {
            setProcessing(true);
            const token = await AsyncStorage.getItem('userToken');

            await axios.post(`${API_URL}/transactions/${transaction._id}/pay`,
                { payment_method: selectedMethod },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setProcessing(false);
            setSuccessModalVisible(true);
        } catch (error) {
            setProcessing(false);
            console.error('Payment error:', error);
            Alert.alert('Payment Failed', error.response?.data?.error || 'Something went wrong. Please try again.');
        }
    };

    const handleSuccessClose = () => {
        setSuccessModalVisible(false);
        navigation.popToTop(); // Go back to dashboard/browsing
        // Or navigate to history: navigation.navigate('TransactionHistory');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Complete Payment</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.amountCard}>
                    <Text style={styles.amountLabel}>Total Amount</Text>
                    <Text style={styles.amountValue}>₹{transaction.amount.toLocaleString()}</Text>
                    <View style={styles.divider} />
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Paying to:</Text>
                        <Text style={styles.detailValue}>{transaction.farmer?.name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>For:</Text>
                        <Text style={styles.detailValue}>{transaction.crop?.name}</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Select Payment Method</Text>

                {paymentMethods.map((method) => (
                    <TouchableOpacity
                        key={method.id}
                        style={[
                            styles.methodCard,
                            selectedMethod === method.id && styles.selectedMethodCard
                        ]}
                        onPress={() => setSelectedMethod(method.id)}
                    >
                        <View style={styles.methodIconContainer}>
                            <Ionicons
                                name={method.icon}
                                size={24}
                                color={selectedMethod === method.id ? theme.colors.primary : theme.colors.text.secondary}
                            />
                        </View>
                        <Text style={[
                            styles.methodName,
                            selectedMethod === method.id && styles.selectedMethodName
                        ]}>
                            {method.name}
                        </Text>
                        <View style={styles.radioOuter}>
                            {selectedMethod === method.id && <View style={styles.radioInner} />}
                        </View>
                    </TouchableOpacity>
                ))}

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.payButton, processing && styles.disabledButton]}
                    onPress={handlePayment}
                    disabled={processing}
                >
                    {processing ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.payButtonText}>Pay ₹{transaction.amount.toLocaleString()}</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Success Modal */}
            <Modal
                transparent={true}
                visible={successModalVisible}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.successIconContainer}>
                            <Ionicons name="checkmark" size={40} color="#FFF" />
                        </View>
                        <Text style={styles.successTitle}>Payment Successful!</Text>
                        <Text style={styles.successMessage}>
                            Your transaction has been completed successfully. The seller has been notified.
                        </Text>
                        <TouchableOpacity style={styles.successButton} onPress={handleSuccessClose}>
                            <Text style={styles.successButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    scrollContent: {
        padding: 20,
    },
    amountCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 30,
        ...theme.shadows.medium,
    },
    amountLabel: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginBottom: 8,
    },
    amountValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 20,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: theme.colors.border,
        marginBottom: 15,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: theme.colors.text.secondary,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 15,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    selectedMethodCard: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.surface, // Could add a tint if desired
    },
    methodIconContainer: {
        width: 40,
        alignItems: 'center',
        marginRight: 10,
    },
    methodName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.text.primary,
    },
    selectedMethodName: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: theme.colors.text.disabled,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.primary,
    },
    footer: {
        padding: 20,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    payButton: {
        backgroundColor: theme.colors.success,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.7,
    },
    payButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        width: '100%',
        elevation: 5,
    },
    successIconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: theme.colors.success,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 10,
    },
    successMessage: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    successButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 25,
    },
    successButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default PaymentScreen;
