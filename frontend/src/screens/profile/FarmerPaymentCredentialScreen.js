import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Animated, Clipboard } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import api from '../../services/api';

const FarmerPaymentCredentialScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const [paymentMethods, setPaymentMethods] = useState({
        upi_id: '',
        bank_account: {
            account_number: '',
            ifsc_code: '',
            bank_name: '',
            account_holder_name: ''
        }
    });

    useEffect(() => {
        fetchPaymentCredentials();
    }, []);

    const fetchPaymentCredentials = async () => {
        try {
            const response = await api.get('/farmer/payment-credentials');
            if (response.data && response.data.payment_methods) {
                setPaymentMethods({
                    upi_id: response.data.payment_methods.upi_id || '',
                    bank_account: {
                        account_number: response.data.payment_methods.bank_account?.account_number || '',
                        ifsc_code: response.data.payment_methods.bank_account?.ifsc_code || '',
                        bank_name: response.data.payment_methods.bank_account?.bank_name || '',
                        account_holder_name: response.data.payment_methods.bank_account?.account_holder_name || ''
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching payment credentials:', error);
            Alert.alert('Error', 'Failed to load payment credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyUPI = () => {
        if (!paymentMethods.upi_id) {
            Alert.alert('Error', 'UPI ID is empty');
            return;
        }
        Clipboard.setString(paymentMethods.upi_id);
        Alert.alert('Success', 'UPI ID copied to clipboard!');
    };

    const handleSave = async () => {
        if (!paymentMethods.upi_id && (!paymentMethods.bank_account.account_number || !paymentMethods.bank_account.ifsc_code)) {
            Alert.alert('Validation Error', 'Please provide either a UPI ID or complete Bank Account details.');
            return;
        }

        setSaving(true);
        try {
            await api.put('/farmer/payment-credentials', { payment_methods: paymentMethods });
            Alert.alert('Success', 'Payment credentials saved successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Error saving payment credentials:', error);
            Alert.alert('Error', 'Failed to save payment credentials. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const updateBankField = (field, value) => {
        setPaymentMethods(prev => ({
            ...prev,
            bank_account: {
                ...prev.bank_account,
                [field]: value
            }
        }));
    };

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment Credentials</Text>
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.sectionTitle}>UPI Details</Text>
                <View style={styles.inputContainer}>
                    <Ionicons name="phone-portrait-outline" size={20} color={theme.colors.text.secondary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="UPI ID (e.g. 9876543210@upi)"
                        value={paymentMethods.upi_id}
                        onChangeText={(text) => setPaymentMethods({ ...paymentMethods, upi_id: text })}
                    />
                    <TouchableOpacity onPress={handleCopyUPI} style={styles.copyButton}>
                        <Ionicons name="copy-outline" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Bank Account Details</Text>

                <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color={theme.colors.text.secondary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Account Holder Name"
                        value={paymentMethods.bank_account.account_holder_name}
                        onChangeText={(text) => updateBankField('account_holder_name', text)}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Ionicons name="card-outline" size={20} color={theme.colors.text.secondary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Account Number"
                        keyboardType="number-pad"
                        value={paymentMethods.bank_account.account_number}
                        onChangeText={(text) => updateBankField('account_number', text)}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Ionicons name="business-outline" size={20} color={theme.colors.text.secondary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Bank Name"
                        value={paymentMethods.bank_account.bank_name}
                        onChangeText={(text) => updateBankField('bank_name', text)}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Ionicons name="barcode-outline" size={20} color={theme.colors.text.secondary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="IFSC Code"
                        autoCapitalize="characters"
                        value={paymentMethods.bank_account.ifsc_code}
                        onChangeText={(text) => updateBankField('ifsc_code', text)}
                    />
                </View>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={handleSave}
                    disabled={saving}
                >
                    <Animated.View style={[styles.saveButton, saving && styles.saveButtonDisabled, { transform: [{ scale: scaleAnim }] }]}>
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Details</Text>
                        )}
                    </Animated.View>
                </TouchableOpacity>

                <Text style={styles.infoText}>
                    <Ionicons name="information-circle-outline" size={16} /> Buyers will use these details to pay you directly. Ensure they are accurate.
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    formContainer: {
        padding: 20,
        backgroundColor: 'white',
        margin: 15,
        borderRadius: 15,
        ...theme.shadows.medium,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 15,
        marginTop: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 15,
        height: 55,
        backgroundColor: theme.colors.surface,
    },
    inputIcon: {
        marginRight: 10,
    },
    copyButton: {
        padding: 5,
        marginLeft: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.text.primary,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: 15,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        ...theme.shadows.small,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoText: {
        marginTop: 15,
        fontSize: 13,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 20,
    }
});

export default FarmerPaymentCredentialScreen;
