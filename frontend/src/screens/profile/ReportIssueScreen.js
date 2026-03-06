import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { trustAPI } from '../../services/api';
import { theme } from '../../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';
import SuccessModal from '../../components/SuccessModal';

const ReportIssueScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [reason, setReason] = useState('Fraud');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [successVisible, setSuccessVisible] = useState(false);

    const handleSubmit = async () => {
        if (!description.trim()) {
            Alert.alert('Error', t('describe_issue_error') || 'Please provide a detailed description of the issue.');
            return;
        }

        setSubmitting(true);
        try {
            await trustAPI.reportIssue({
                reason,
                description
            });
            setSuccessVisible(true);
        } catch (error) {
            console.error('Report issue error:', error);
            Alert.alert('Error', t('report_issue_failed') || 'Failed to submit your report. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('report_issue') || 'Report an Issue'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.infoCard}>
                    <Ionicons name="shield-checkmark-outline" size={32} color={theme.colors.primary} />
                    <Text style={styles.infoText}>
                        {t('report_info_msg') || 'Your safety is our priority. Please describe the problem you encountered, and our team will investigate it promptly.'}
                    </Text>
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.label}>{t('issue_reason') || 'What is the issue about?'}</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={reason}
                            onValueChange={(itemValue) => setReason(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Fraud or Scam" value="Fraud" />
                            <Picker.Item label="Quality Difference" value="Quality Difference" />
                            <Picker.Item label="Payment Issue" value="Payment Issue" />
                            <Picker.Item label="Delivery Delay" value="Delivery Delay" />
                            <Picker.Item label="Platform Error" value="Platform Error" />
                            <Picker.Item label="Other" value="Other" />
                        </Picker>
                    </View>

                    <Text style={styles.label}>{t('issue_description') || 'Please describe in detail'}</Text>
                    <TextInput
                        style={styles.textArea}
                        multiline
                        numberOfLines={6}
                        placeholder={t('issue_description_placeholder') || 'Include transaction details, user names, and exact events...'}
                        placeholderTextColor={theme.colors.text.disabled}
                        value={description}
                        onChangeText={setDescription}
                        maxLength={1000}
                    />
                    <Text style={styles.charCount}>{description.length}/1000</Text>
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    <LinearGradient
                        colors={submitting ? ['#aaa', '#aaa'] : [theme.colors.error, '#d32f2f']}
                        style={styles.buttonGradient}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="warning-outline" size={20} color="#fff" />
                                <Text style={styles.buttonText}>{t('submit_report') || 'Submit Report'}</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>

            <SuccessModal
                visible={successVisible}
                title={t('report_submitted') || 'Report Submitted'}
                message={t('report_success_msg') || 'Thank you for reporting. Our support team will review this issue and take necessary actions.'}
                onClose={() => {
                    setSuccessVisible(false);
                    navigation.goBack();
                }}
                buttonText={t('back_to_support') || 'Back'}
            />
        </KeyboardAvoidingView>
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
        ...theme.shadows.small,
        zIndex: 10
    },
    backButton: {
        padding: 5
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text.primary
    },
    content: {
        padding: 20
    },
    infoCard: {
        backgroundColor: theme.colors.p20,
        padding: 20,
        borderRadius: theme.borderRadius.m,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
        borderWidth: 1,
        borderColor: theme.colors.p40
    },
    infoText: {
        flex: 1,
        marginLeft: 15,
        fontSize: 14,
        color: theme.colors.text.secondary,
        lineHeight: 20
    },
    formSection: {
        marginBottom: 25
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: 10
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.m,
        backgroundColor: theme.colors.surface,
        marginBottom: 20,
        overflow: 'hidden'
    },
    picker: {
        height: 50,
        color: theme.colors.text.primary
    },
    textArea: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.m,
        backgroundColor: theme.colors.surface,
        padding: 15,
        height: 150,
        textAlignVertical: 'top',
        fontSize: 16,
        color: theme.colors.text.primary
    },
    charCount: {
        textAlign: 'right',
        fontSize: 12,
        color: theme.colors.text.disabled,
        marginTop: 5
    },
    submitButton: {
        borderRadius: theme.borderRadius.l,
        overflow: 'hidden',
        ...theme.shadows.medium
    },
    submitButtonDisabled: {
        opacity: 0.7
    },
    buttonGradient: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8
    }
});

export default ReportIssueScreen;
