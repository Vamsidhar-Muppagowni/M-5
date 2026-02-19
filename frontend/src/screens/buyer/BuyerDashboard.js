import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image, Dimensions, Modal } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { changeLanguage } from '../../services/language';
import api from '../../services/api';
import { theme } from '../../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Tooltip from '../../components/Tooltip';

const { width } = Dimensions.get('window');

const BuyerDashboard = ({ navigation }) => {
    const { user } = useSelector(state => state.auth);
    const { t, i18n } = useTranslation();
    const [stats, setStats] = useState({
        activeBids: 0,
        acceptedBids: 0,
        pendingBids: 0
    });
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

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

    const fetchStats = async () => {
        try {
            const response = await api.get('/market/my-bids');
            const bids = response.data.bids || [];

            setStats({
                activeBids: bids.filter(b => b.status === 'pending').length,
                acceptedBids: bids.filter(b => b.status === 'accepted').length,
                pendingBids: bids.filter(b => b.status === 'pending').length
            });
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchStats();
    }, []);

    const QuickAction = ({ icon, title, color, onPress }) => (
        <TouchableOpacity style={styles.actionCard} onPress={onPress}>
            <View style={[styles.actionIconContainer, { backgroundColor: color }]}>
                <Ionicons name={icon} size={28} color="#fff" />
            </View>
            <Text style={styles.actionText}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.greetingSubtitle}>{t('welcome_back')},</Text>
                    <Text style={styles.greetingTitle}>{user?.name?.split(' ')[0] || 'Buyer'} 👋</Text>
                    <Text style={styles.subtitle}>{t('marketplace_dashboard')}</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.languageButton} onPress={() => setModalVisible(true)}>
                        <Text style={styles.languageButtonText}>{i18n.language.toUpperCase()}</Text>
                        <Ionicons name="chevron-down" size={16} color={theme.colors.primary} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
                        <LinearGradient
                            colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                            style={styles.avatar}
                        >
                            <Text style={styles.avatarText}>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

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
                            <Text style={styles.modalTitle}>{t('change_language') || 'Select Language'}</Text>
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

            <ScrollView
                style={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
            >
                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('MyBids')}>
                        <View style={[styles.iconBg, { backgroundColor: '#e3f2fd' }]}>
                            <Ionicons name="time" size={24} color="#1565c0" />
                        </View>
                        <Text style={styles.statValue}>{stats.activeBids}</Text>
                        <View style={styles.statLabelRow}>
                            <Text style={styles.statLabel}>{t('active_bids')}</Text>
                            <Tooltip text={t('active_bids_tooltip') || 'Number of bids you have placed that are still pending response from farmers.'} iconSize={14} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('MyBids')}>
                        <View style={[styles.iconBg, { backgroundColor: '#e8f5e9' }]}>
                            <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                        </View>
                        <Text style={styles.statValue}>{stats.acceptedBids}</Text>
                        <View style={styles.statLabelRow}>
                            <Text style={styles.statLabel}>{t('accepted_bids')}</Text>
                            <Tooltip text={t('accepted_bids_tooltip') || 'Bids that farmers have accepted. Proceed to complete these transactions.'} iconSize={14} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>{t('quick_actions')}</Text>
                <View style={styles.actionsGrid}>
                    <QuickAction
                        icon="search"
                        title={t('browse_market')}
                        color={theme.colors.primary}
                        onPress={() => navigation.navigate('Browse')}
                    />
                    <QuickAction
                        icon="trending-up"
                        title={t('check_prices')}
                        color={theme.colors.secondary}
                        onPress={() => navigation.navigate('Prices')}
                    />
                </View>

                {/* Featured / Trending Section (Mock) */}
                <Text style={styles.sectionTitle}>{t('market_trends')}</Text>
                <View style={styles.trendCard}>
                    <LinearGradient
                        colors={[theme.colors.surface, '#f0fdf4']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.trendGradient}
                    >
                        <View style={styles.trendHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={styles.trendIconBox}>
                                    <Ionicons name="analytics" size={20} color={theme.colors.primary} />
                                </View>
                                <Text style={styles.trendTitle}>Cotton</Text>
                            </View>
                            <Text style={styles.trendPrice}>₹6500/q</Text>
                        </View>
                        <Text style={styles.trendSubtitle}>Price up by 5% this week</Text>
                        <View style={styles.trendFooter}>
                            <TouchableOpacity onPress={() => navigation.navigate('Prices')} style={styles.trendButton}>
                                <Text style={styles.trendLink}>{t('view_chart')}</Text>
                                <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>

                <View style={{ height: 20 }} />
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: theme.colors.surface,
        borderBottomLeftRadius: theme.borderRadius.l,
        borderBottomRightRadius: theme.borderRadius.l,
        ...theme.shadows.medium,
        zIndex: 10
    },
    headerLeft: {
        flex: 1
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    greetingSubtitle: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginBottom: 2
    },
    greetingTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text.primary
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginTop: 2
    },
    languageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#f1f8e9',
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#c8e6c9'
    },
    languageButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.primary
    },
    profileButton: {
        ...theme.shadows.small
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.surface
    },
    avatarText: {
        color: theme.colors.text.light,
        fontWeight: 'bold',
        fontSize: 18
    },
    content: {
        flex: 1
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 20,
        justifyContent: 'space-between'
    },
    statCard: {
        backgroundColor: theme.colors.surface,
        width: (width - 50) / 2,
        padding: 20,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
        ...theme.shadows.small,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    iconBg: {
        padding: 12,
        borderRadius: 50,
        marginBottom: 10
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text.primary
    },
    statLabel: {
        fontSize: 14,
        color: theme.colors.text.secondary
    },
    statLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginLeft: 20,
        marginBottom: 15,
        marginTop: 10
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 15,
        justifyContent: 'space-between'
    },
    actionCard: {
        width: (width - 50) / 2,
        backgroundColor: theme.colors.surface,
        padding: 15,
        borderRadius: theme.borderRadius.m,
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
        height: 110,
        ...theme.shadows.small,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    actionIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        ...theme.shadows.small
    },
    actionText: {
        color: theme.colors.text.primary,
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center'
    },
    trendCard: {
        marginHorizontal: 20,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        ...theme.shadows.medium,
        marginBottom: 10,
        overflow: 'hidden'
    },
    trendGradient: {
        padding: 20
    },
    trendHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5
    },
    trendIconBox: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    trendTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary
    },
    trendPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.success
    },
    trendSubtitle: {
        color: theme.colors.text.secondary,
        marginTop: 5
    },
    trendFooter: {
        marginTop: 15,
        alignItems: 'flex-end'
    },
    trendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f8e9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15
    },
    trendLink: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        marginRight: 5
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        width: '85%',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
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
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.s,
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
    }
});

export default BuyerDashboard;
