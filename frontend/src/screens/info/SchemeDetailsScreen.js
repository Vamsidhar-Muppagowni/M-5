import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../styles/theme';

const SchemeDetailsScreen = ({ route, navigation }) => {
    const { t } = useTranslation();
    const { scheme } = route.params;

    const handleApply = async () => {
        if (scheme.application_link) {
            try {
                const supported = await Linking.canOpenURL(scheme.application_link);
                if (supported) {
                    await Linking.openURL(scheme.application_link);
                } else {
                    Alert.alert(t('error') || 'Error', t('unable_open_link') || 'Unable to open the application link.');
                }
            } catch (error) {
                Alert.alert(t('error') || 'Error', t('something_wrong') || 'Something went wrong while opening the link.');
            }
        } else {
            Alert.alert(t('scheme_details'), t('no_app_link') || 'No application link available for this scheme.');
        }
    };

    // Get translated scheme name
    const getSchemeName = () => {
        if (scheme.name === 'PM-KISAN') return t('pmkisan_name') || scheme.name;
        if (scheme.name === 'KCC') return t('kcc_name') || scheme.name;
        return scheme.name;
    };

    // Get translated description
    const getDescription = () => {
        if (scheme.name === 'PM-KISAN') return t('pmkisan_description') || scheme.description;
        if (scheme.name === 'KCC') return t('kcc_description') || scheme.description;
        return scheme.description;
    };

    // Get translated benefits
    const getBenefits = () => {
        if (scheme.name === 'PM-KISAN') return t('pmkisan_benefits') || scheme.benefits;
        if (scheme.name === 'KCC') return t('kcc_benefits') || scheme.benefits;
        return scheme.benefits;
    };

    // Get translated eligibility
    const getEligibility = () => {
        if (scheme.name === 'PM-KISAN') return t('pmkisan_eligibility') || scheme.eligibility_criteria;
        if (scheme.name === 'KCC') return t('kcc_eligibility') || scheme.eligibility_criteria;
        return scheme.eligibility_criteria;
    };

    // Get translated required documents
    const getRequiredDocuments = () => {
        if (scheme.name === 'PM-KISAN') {
            return [
                t('pmkisan_doc1'),
                t('pmkisan_doc2'),
                t('pmkisan_doc3'),
                t('pmkisan_doc4')
            ];
        }
        if (scheme.name === 'KCC') {
            return [
                t('kcc_doc1'),
                t('kcc_doc2'),
                t('kcc_doc3'),
                t('kcc_doc4'),
                t('kcc_doc5'),
                t('kcc_doc6')
            ];
        }
        if (scheme.required_documents && scheme.required_documents.length > 0) return scheme.required_documents;
        // Fallback for old data
        return [
            t('doc_aadhaar') || 'Aadhaar Card (mandatory)',
            t('doc_land_records') || 'Land ownership records / Patta',
            t('doc_bank_details') || 'Bank account details with IFSC',
            t('doc_photos') || 'Passport-size photographs (2 copies)',
            t('doc_income_cert') || 'Income certificate from Tehsildar'
        ];
    };

    // Get translated how-to-apply steps
    const getHowToApply = () => {
        if (scheme.name === 'PM-KISAN') {
            return [
                t('pmkisan_step1'),
                t('pmkisan_step2'),
                t('pmkisan_step3'),
                t('pmkisan_step4'),
                t('pmkisan_step5'),
                t('pmkisan_step6'),
                t('pmkisan_step7'),
                t('pmkisan_step8')
            ];
        }
        if (scheme.name === 'KCC') {
            return [
                t('kcc_step1'),
                t('kcc_step2'),
                t('kcc_step3'),
                t('kcc_step4'),
                t('kcc_step5'),
                t('kcc_step6'),
                t('kcc_step7'),
                t('kcc_step8'),
                t('kcc_step9')
            ];
        }
        if (scheme.how_to_apply && scheme.how_to_apply.length > 0) return scheme.how_to_apply;
        // Fallback for old data
        return [
            t('apply_step_1') || 'Visit the official scheme website',
            t('apply_step_2') || 'Click on "New Registration" or "Apply Online"',
            t('apply_step_3') || 'Fill in your personal and land details',
            t('apply_step_4') || 'Upload required documents',
            t('apply_step_5') || 'Submit and note your application number',
            t('apply_step_6') || 'Track status online using your application ID'
        ];
    };

    // Get translated important dates
    const getImportantDates = () => {
        if (scheme.name === 'PM-KISAN') {
            return [
                { label: t('pmkisan_date1_label'), value: t('pmkisan_date1_value') },
                { label: t('pmkisan_date2_label'), value: t('pmkisan_date2_value') },
                { label: t('pmkisan_date3_label'), value: t('pmkisan_date3_value') },
                { label: t('pmkisan_date4_label'), value: t('pmkisan_date4_value') }
            ];
        }
        if (scheme.name === 'KCC') {
            return [
                { label: t('kcc_date1_label'), value: t('kcc_date1_value') },
                { label: t('kcc_date2_label'), value: t('kcc_date2_value') },
                { label: t('kcc_date3_label'), value: t('kcc_date3_value') },
                { label: t('kcc_date4_label'), value: t('kcc_date4_value') }
            ];
        }
        if (scheme.important_dates && scheme.important_dates.length > 0) return scheme.important_dates;
        // Fallback
        return [
            { label: t('date_application') || 'Application Window', value: t('date_year_round') || 'Open year-round' },
            { label: t('date_processing') || 'Processing Time', value: t('date_processing_value') || '30-45 working days' },
            { label: t('date_disbursement') || 'Benefit Disbursement', value: t('date_disbursement_value') || 'Within 60 days of approval' }
        ];
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('scheme_details')}</Text>
                    <View style={{ width: 24 }} />
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Scheme Name & Icon */}
                <View style={styles.titleCard}>
                    <View style={styles.titleIconContainer}>
                        <Ionicons name="document-text" size={32} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.schemeName}>{getSchemeName()}</Text>
                    <Text style={styles.ministry}>{t('ministry_agriculture')}</Text>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
                        <Text style={styles.sectionTitle}>{t('scheme_info')}</Text>
                    </View>
                    <Text style={styles.description}>{getDescription()}</Text>
                </View>

                {/* Benefits */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="gift" size={20} color={theme.colors.success} />
                        <Text style={styles.sectionTitle}>{t('benefits_label')}</Text>
                    </View>
                    <View style={styles.benefitsBox}>
                        <Text style={styles.benefitsText}>{getBenefits()}</Text>
                    </View>
                </View>

                {/* Eligibility */}
                {getEligibility() && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="checkmark-circle" size={20} color={theme.colors.secondary} />
                            <Text style={styles.sectionTitle}>{t('eligibility')}</Text>
                        </View>
                        <Text style={styles.description}>{getEligibility()}</Text>
                    </View>
                )}

                {/* Scheme Coverage */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="globe-outline" size={20} color="#1565c0" />
                        <Text style={styles.sectionTitle}>{t('scheme_coverage') || 'Scheme Coverage'}</Text>
                    </View>
                    <View style={styles.coverageGrid}>
                        <View style={styles.coverageItem}>
                            <View style={[styles.coverageIcon, { backgroundColor: '#e8f5e9' }]}>
                                <Ionicons name="people" size={18} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.coverageLabel}>{t('coverage_target') || 'Target'}</Text>
                            <Text style={styles.coverageValue}>{t('coverage_target_value') || 'Small & Marginal Farmers'}</Text>
                        </View>
                        <View style={styles.coverageItem}>
                            <View style={[styles.coverageIcon, { backgroundColor: '#e3f2fd' }]}>
                                <Ionicons name="map" size={18} color="#1565c0" />
                            </View>
                            <Text style={styles.coverageLabel}>{t('coverage_area') || 'Coverage'}</Text>
                            <Text style={styles.coverageValue}>{t('coverage_area_value') || 'All States & UTs'}</Text>
                        </View>
                        <View style={styles.coverageItem}>
                            <View style={[styles.coverageIcon, { backgroundColor: '#fff3e0' }]}>
                                <Ionicons name="wallet" size={18} color={theme.colors.secondary} />
                            </View>
                            <Text style={styles.coverageLabel}>{t('coverage_funding') || 'Funding'}</Text>
                            <Text style={styles.coverageValue}>{t('coverage_funding_value') || 'Central Government'}</Text>
                        </View>
                    </View>
                </View>

                {/* Required Documents */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="folder-open" size={20} color="#7b1fa2" />
                        <Text style={styles.sectionTitle}>{t('required_documents') || 'Required Documents'}</Text>
                    </View>
                    {getRequiredDocuments().map((doc, index) => (
                        <View key={index} style={styles.listItem}>
                            <View style={styles.bulletPoint}>
                                <Ionicons name="document-outline" size={16} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.listText}>{doc}</Text>
                        </View>
                    ))}
                </View>

                {/* How to Apply */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="footsteps" size={20} color={theme.colors.primary} />
                        <Text style={styles.sectionTitle}>{t('how_to_apply') || 'How to Apply'}</Text>
                    </View>
                    {getHowToApply().map((step, index) => (
                        <View key={index} style={styles.stepItem}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.stepText}>{step}</Text>
                        </View>
                    ))}
                </View>

                {/* Important Dates */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="calendar" size={20} color={theme.colors.error} />
                        <Text style={styles.sectionTitle}>{t('important_dates') || 'Important Dates'}</Text>
                    </View>
                    {getImportantDates().map((item, index) => (
                        <View key={index} style={styles.dateItem}>
                            <Text style={styles.dateLabel}>{item.label}</Text>
                            <Text style={styles.dateValue}>{item.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Apply Button */}
                <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                    <LinearGradient
                        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                        style={styles.applyGradient}
                    >
                        <Ionicons name="open-outline" size={20} color="#fff" />
                        <Text style={styles.applyButtonText}>{t('apply_online')}</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Application Link Info */}
                {scheme.application_link && (
                    <Text style={styles.linkText}>{scheme.application_link}</Text>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: theme.borderRadius.l,
        borderBottomRightRadius: theme.borderRadius.l,
        ...theme.shadows.medium
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff'
    },
    backButton: {
        padding: 5
    },
    content: {
        flex: 1,
        padding: 20
    },
    titleCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
        ...theme.shadows.small,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    titleIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.p20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16
    },
    schemeName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        textAlign: 'center',
        marginBottom: 4
    },
    ministry: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        textAlign: 'center'
    },
    section: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        padding: 16,
        marginBottom: 16,
        ...theme.shadows.small,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginLeft: 8
    },
    description: {
        fontSize: 15,
        color: theme.colors.text.secondary,
        lineHeight: 22
    },
    benefitsBox: {
        backgroundColor: '#f0f9f0',
        padding: 12,
        borderRadius: 8
    },
    benefitsText: {
        fontSize: 15,
        color: theme.colors.primary,
        fontWeight: '600',
        lineHeight: 22
    },
    coverageGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    coverageItem: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 4
    },
    coverageIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8
    },
    coverageLabel: {
        fontSize: 11,
        color: theme.colors.text.secondary,
        marginBottom: 2,
        textAlign: 'center'
    },
    coverageValue: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.text.primary,
        textAlign: 'center'
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
        paddingLeft: 4
    },
    bulletPoint: {
        marginRight: 10,
        marginTop: 2
    },
    listText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        lineHeight: 20,
        flex: 1
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        paddingLeft: 4
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 1
    },
    stepNumberText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold'
    },
    stepText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        lineHeight: 20,
        flex: 1
    },
    dateItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border
    },
    dateLabel: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        flex: 1
    },
    dateValue: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.primary,
        flex: 1,
        textAlign: 'right'
    },
    applyButton: {
        marginTop: 8,
        marginBottom: 12,
        borderRadius: theme.borderRadius.m,
        overflow: 'hidden',
        ...theme.shadows.medium
    },
    applyGradient: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: theme.borderRadius.m
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10
    },
    linkText: {
        textAlign: 'center',
        color: theme.colors.text.disabled,
        fontSize: 12,
        marginTop: 4
    }
});

export default SchemeDetailsScreen;
