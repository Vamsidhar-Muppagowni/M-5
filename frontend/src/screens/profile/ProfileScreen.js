import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '../../store/slices/authSlice';
import { changeLanguage } from '../../services/language';

const ProfileScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const { user } = useSelector(state => state.auth);
    const [modalVisible, setModalVisible] = useState(false);
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);

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
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </Text>
                </View>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.role}>{user.type ? user.type.toUpperCase() : 'FARMER'}</Text>
                <Text style={styles.phone}>{user.phone}</Text>
            </View>

            {/* Settings Options */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('profile_title')}</Text>

                <TouchableOpacity style={styles.option} onPress={() => setModalVisible(true)}>
                    <View style={styles.optionLeft}>
                        <View style={[styles.iconBox, { backgroundColor: '#e3f2fd' }]}>
                            <Ionicons name="language" size={22} color="#1565c0" />
                        </View>
                        <Text style={styles.optionText}>{t('change_language')}</Text>
                    </View>
                    <View style={styles.optionRight}>
                        <Text style={styles.valueText}>{i18n.language.toUpperCase()}</Text>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option}>
                    <View style={styles.optionLeft}>
                        <View style={[styles.iconBox, { backgroundColor: '#f3e5f5' }]}>
                            <Ionicons name="create-outline" size={22} color="#7b1fa2" />
                        </View>
                        <Text style={styles.optionText}>{t('edit_profile')}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.option}>
                    <View style={styles.optionLeft}>
                        <View style={[styles.iconBox, { backgroundColor: '#e0f7fa' }]}>
                            <Ionicons name="help-circle-outline" size={22} color="#006064" />
                        </View>
                        <Text style={styles.optionText}>{t('help_support')}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="#d32f2f" />
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
                                width: 60, height: 60, borderRadius: 30, backgroundColor: '#ffebee',
                                justifyContent: 'center', alignItems: 'center', marginBottom: 15
                            }}>
                                <Ionicons name="log-out" size={30} color="#d32f2f" />
                            </View>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 }}>
                                {t('logout') || 'Logout'}
                            </Text>
                            <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
                                {t('logout_confirm') || 'Are you sure you want to logout?'}
                            </Text>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1, paddingVertical: 12, marginRight: 10, borderRadius: 10,
                                    borderWidth: 1, borderColor: '#ddd', alignItems: 'center'
                                }}
                                onPress={() => setLogoutModalVisible(false)}
                            >
                                <Text style={{ color: '#666', fontWeight: '600' }}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    flex: 1, paddingVertical: 12, marginLeft: 10, borderRadius: 10,
                                    backgroundColor: '#d32f2f', alignItems: 'center'
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
                                <Ionicons name="close" size={24} color="#666" />
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
                                    <Ionicons name="checkmark-circle" size={24} color="#2e7d32" />
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
        backgroundColor: '#f8f9fa'
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        alignItems: 'center',
        padding: 30,
        backgroundColor: '#fff',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 20
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#2e7d32',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 4,
        borderColor: '#e8f5e9'
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff'
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5
    },
    role: {
        fontSize: 14,
        color: '#2e7d32',
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 5
    },
    phone: {
        fontSize: 14,
        color: '#666'
    },
    section: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        marginBottom: 20
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#888',
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
        borderBottomColor: '#f9f9f9'
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
        color: '#333'
    },
    optionRight: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    valueText: {
        fontSize: 14,
        color: '#888',
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
        color: '#d32f2f'
    },
    // Modal Styles (Copied from Dashboard for consistency)
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10
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
        color: '#333'
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    languageOptionActive: {
        backgroundColor: '#f0f9f0',
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
        color: '#333',
        flex: 1
    },
    languageLabelActive: {
        fontWeight: 'bold',
        color: '#2e7d32'
    }
});

export default ProfileScreen;
