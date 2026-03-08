import React, { useState } from 'react';
import { Card, ProgressBar } from 'react-native-paper';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '../../store/slices/authSlice';
import { changeLanguage } from '../../services/language';
import { theme } from '../../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';

const ProfileScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const { user } = useSelector(state => state.auth);
    const [modalVisible, setModalVisible] = useState(false);
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);

    const calculateCompletion = () => {
        let completion = 0;
        if (user.name) completion += 0.25;
        if (user.email) completion += 0.25;
        if (user.location && (user.location.address_line1 || user.location.city)) completion += 0.25;
        // For payment info, since it's fetched separately, we'll check if it's potentially there 
        // or just use a dummy check for the UI demonstration if not available in Redux
        if (user.is_verified || user.farmerProfile) completion += 0.25;
        return completion;
    };

    const completionLevel = calculateCompletion();

    const performLogout = async () => {
        setLogoutModalVisible(false);
        try {
            await AsyncStorage.clear();
            dispatch(logout());
            const parent = navigation.getParent();
            if (parent) {
                parent.reset({ index: 0, routes: [{ name: 'Login' }] });
            } else {
                navigation.replace('Login');
            }
        } catch (e) {
            console.error("Logout Error:", e);
            navigation.navigate('Login');
        }
    };

    const handleLogout = () => {
        setLogoutModalVisible(true);
    };

    const languages = [
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'hi', label: 'हिंदी (Hindi)', flag: '🇮🇳' },
        { code: 'te', label: 'తెలుగు (Telugu)', flag: '🇮🇳' },
        { code: 'ta', label: 'தமிழ் (Tamil)', flag: '🇮🇳' },
        { code: 'kn', label: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
        { code: 'ml', label: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
        { code: 'bn', label: 'বাংলা (Bengali)', flag: '🇮🇳' },
        { code: 'mr', label: 'मराठी (Marathi)', flag: '🇮🇳' },
        { code: 'gu', label: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' }
    ];

    const handleLanguageChange = (langCode) => {
        changeLanguage(langCode);
        setModalVisible(false);
    };

    if (!user) {
        return (
            <View style={styles.center}>
                <Text>Loading User...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header / Profile Card */}
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.header}
            >
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </Text>
                </View>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.role}>
                    {user.user_type === 'farmer' ? t('role_farmer') :
                        user.user_type === 'buyer' ? t('role_buyer') :
                            user.user_type === 'admin' ? t('role_admin') : t('unknown_role')}
                </Text>
                <Text style={styles.phone}>{user.phone}</Text>

                {/* Profile Completion Progress */}
                <View style={styles.completionContainer}>
                    <View style={styles.completionHeader}>
                        <Text style={styles.completionLabel}>Profile Completion</Text>
                        <Text style={styles.completionPercent}>{Math.round(completionLevel * 100)}%</Text>
                    </View>
                    <ProgressBar
                        progress={completionLevel}
                        color={completionLevel === 1 ? theme.colors.success : theme.colors.secondary}
                        style={styles.progressBar}
                    />
                </View>
            </LinearGradient>

            {/* Farmer Statistics Section */}
            {user.user_type === 'farmer' && (
                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>{t('farmer_stats') || 'Farmer Statistics'}</Text>
                    <View style={styles.statsGrid}>
                        <Card style={styles.statCard}>
                            <Card.Content style={styles.statContent}>
                                <View style={[styles.statIconBox, { backgroundColor: '#e8f5e9' }]}>
                                    <Ionicons name="leaf" size={24} color="#2e7d32" />
                                </View>
                                <Text style={styles.statValue}>12</Text>
                                <Text style={styles.statLabel}>{t('total_crops') || 'Total Crops Listed'}</Text>
                            </Card.Content>
                        </Card>

                        <Card style={styles.statCard}>
                            <Card.Content style={styles.statContent}>
                                <View style={[styles.statIconBox, { backgroundColor: '#e3f2fd' }]}>
                                    <Ionicons name="checkmark-circle" size={24} color="#1565c0" />
                                </View>
                                <Text style={styles.statValue}>45</Text>
                                <Text style={styles.statLabel}>{t('successful_sales') || 'Successful Sales'}</Text>
                            </Card.Content>
                        </Card>

                        <Card style={styles.statCard}>
                            <Card.Content style={styles.statContent}>
                                <View style={[styles.statIconBox, { backgroundColor: '#fff3e0' }]}>
                                    <Ionicons name="hammer" size={24} color="#ef6c00" />
                                </View>
                                <Text style={styles.statValue}>8</Text>
                                <Text style={styles.statLabel}>{t('active_bids') || 'Active Bids'}</Text>
                            </Card.Content>
                        </Card>

                        <Card style={styles.statCard}>
                            <Card.Content style={styles.statContent}>
                                <View style={[styles.statIconBox, { backgroundColor: '#f3e5f5' }]}>
                                    <Ionicons name="cash" size={24} color="#7b1fa2" />
                                </View>
                                <Text style={styles.statValue}>₹ 12.5k</Text>
                                <Text style={styles.statLabel}>{t('total_earnings') || 'Total Earnings'}</Text>
                            </Card.Content>
                        </Card>
                    </View>
                </View>
            )}

            {/* Settings Options */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('profile_title')}</Text>

                <TouchableOpacity style={styles.option} onPress={() => setModalVisible(true)}>
                    <View style={styles.optionLeft}>
                        <View style={[styles.iconBox, { backgroundColor: theme.colors.p20 }]}>
                            <Ionicons name="language" size={22} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.optionText}>{t('change_language')}</Text>
                    </View>
                    <View style={styles.optionRight}>
                        <Text style={styles.valueText}>{i18n.language.toUpperCase()}</Text>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.disabled} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('EditProfile')}>
                    <View style={styles.optionLeft}>
                        <View style={[styles.iconBox, { backgroundColor: '#f3e5f5' }]}>
                            <Ionicons name="create-outline" size={22} color="#7b1fa2" />
                        </View>
                        <Text style={styles.optionText}>{t('edit_profile')}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.text.disabled} />
                </TouchableOpacity>

                {user.user_type === 'farmer' && (
                    <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('PaymentCredentials')}>
                        <View style={styles.optionLeft}>
                            <View style={[styles.iconBox, { backgroundColor: '#e8f5e9' }]}>
                                <Ionicons name="card-outline" size={22} color="#2e7d32" />
                            </View>
                            <Text style={styles.optionText}>Payment Info</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.disabled} />
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('HelpSupport')}>
                    <View style={styles.optionLeft}>
                        <View style={[styles.iconBox, { backgroundColor: '#e0f7fa' }]}>
                            <Ionicons name="help-circle-outline" size={22} color="#006064" />
                        </View>
                        <Text style={styles.optionText}>{t('help_support')}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.text.disabled} />
                </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
                <Text style={styles.logoutText}>{t('logout')}</Text>
            </TouchableOpacity>

            {/* Logout Confirmation Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={logoutModalVisible}
                onRequestClose={() => setLogoutModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setLogoutModalVisible(false)}
                >
                    <View style={[styles.modalContent, { width: '85%', padding: 25 }]}>
                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                            <View style={{
                                width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.error + '20',
                                justifyContent: 'center', alignItems: 'center', marginBottom: 15
                            }}>
                                <Ionicons name="log-out" size={30} color={theme.colors.error} />
                            </View>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text.primary, marginBottom: 10 }}>
                                {t('logout') || 'Logout'}
                            </Text>
                            <Text style={{ fontSize: 14, color: theme.colors.text.secondary, textAlign: 'center' }}>
                                {t('logout_confirm') || 'Are you sure you want to logout?'}
                            </Text>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1, paddingVertical: 12, marginRight: 10, borderRadius: 10,
                                    borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center'
                                }}
                                onPress={() => setLogoutModalVisible(false)}
                            >
                                <Text style={{ color: theme.colors.text.secondary, fontWeight: '600' }}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    flex: 1, paddingVertical: 12, marginLeft: 10, borderRadius: 10,
                                    backgroundColor: theme.colors.error, alignItems: 'center'
                                }}
                                onPress={performLogout}
                            >
                                <Text style={{ color: '#fff', fontWeight: '600' }}>{t('logout') || 'Logout'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Language Selection Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Language</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.text.secondary} />
                            </TouchableOpacity>
                        </View>

                        {languages.map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                style={[
                                    styles.languageOption,
                                    i18n.language === lang.code && styles.languageOptionActive
                                ]}
                                onPress={() => handleLanguageChange(lang.code)}
                            >
                                <Text style={styles.languageFlag}>{lang.flag}</Text>
                                <Text style={[
                                    styles.languageLabel,
                                    i18n.language === lang.code && styles.languageLabelActive
                                ]}>
                                    {lang.label}
                                </Text>
                                {i18n.language === lang.code && (
                                    <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        alignItems: 'center',
        padding: 30,
        backgroundColor: theme.colors.primary,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        ...theme.shadows.medium,
        marginBottom: 20
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)'
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff'
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5
    },
    role: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 5
    },
    phone: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)'
    },
    section: {
        backgroundColor: theme.colors.surface,
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 10,
        ...theme.shadows.small,
        marginBottom: 20
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.text.secondary,
        marginLeft: 15,
        marginTop: 15,
        marginBottom: 10
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.background
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    optionText: {
        fontSize: 16,
        color: theme.colors.text.primary
    },
    optionRight: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    valueText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginRight: 8
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffebee',
        marginHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 16,
        marginBottom: 30
    },
    logoutText: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.error
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        width: '85%',
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        padding: 20,
        ...theme.shadows.large
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text.primary
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border
    },
    languageOptionActive: {
        backgroundColor: theme.colors.p20,
        borderRadius: 10,
        paddingHorizontal: 10,
        borderBottomWidth: 0
    },
    languageFlag: {
        fontSize: 24,
        marginRight: 15
    },
    languageLabel: {
        fontSize: 16,
        color: theme.colors.text.primary,
        flex: 1
    },
    languageLabelActive: {
        fontWeight: 'bold',
        color: theme.colors.primary
    },
    // Stats Section Styles
    statsSection: {
        marginBottom: 10
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 20
    },
    statCard: {
        width: '48%',
        marginBottom: 15,
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        elevation: 2,
        ...theme.shadows.small
    },
    statContent: {
        alignItems: 'center',
        paddingVertical: 15
    },
    statIconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 4
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        textAlign: 'center'
    },
    // Completion Styles
    completionContainer: {
        width: '85%',
        marginTop: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        padding: 15,
        borderRadius: 15,
    },
    completionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    completionLabel: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600'
    },
    completionPercent: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold'
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.2)'
    }
});

export default ProfileScreen;
