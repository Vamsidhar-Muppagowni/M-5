import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    useWindowDimensions,
    ScrollView,
    Image
} from 'react-native';
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from '../../components/CustomButton';
import StyledInput from '../../components/StyledInput';
import { theme } from '../../styles/theme';

const LoginScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [role, setRole] = useState('farmer'); // 'farmer', 'buyer'
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [phoneError, setPhoneError] = useState('');
    const dispatch = useDispatch();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;

    const validatePhone = (value) => {
        const digitsOnly = value.replace(/[^0-9]/g, '');
        setPhone(digitsOnly);
        if (digitsOnly.length > 0 && digitsOnly.length !== 10) {
            setPhoneError(t('phone_invalid') || 'Phone number must be exactly 10 digits');
        } else {
            setPhoneError('');
        }
    };

    const handleLogin = async () => {
        try {
            if (!phone || !password) {
                Alert.alert('Error', t('error_fill_fields') || 'Please fill in all fields');
                return;
            }

            if (phone.length !== 10) {
                setPhoneError(t('phone_invalid') || 'Phone number must be exactly 10 digits');
                return;
            }

            setLoading(true);
            const resultAction = await dispatch(login({ phone, password }));
            setLoading(false);

            if (login.fulfilled.match(resultAction)) {
                const user = resultAction.payload.user;
                if (user.user_type === 'farmer') {
                    navigation.replace('FarmerTabs');
                } else {
                    navigation.replace('BuyerTabs');
                }
            } else {
                // Always show error message for failed login
                const errorMsg = resultAction.payload || 'Login failed';
                Alert.alert(
                    t('invalid_credentials') || 'Invalid Credentials',
                    t('invalid_credentials_msg') || 'The phone number or password you entered is incorrect. Please try again.'
                );
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
            Alert.alert(
                t('invalid_credentials') || 'Error',
                t('invalid_credentials_msg') || 'An unexpected error occurred. Please try again.'
            );
        }
    };

    return (
        <LinearGradient
            colors={[theme.colors.background, theme.colors.surface]}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={[styles.container, isDesktop && styles.containerDesktop]}>
                    {/* Left Side - Promotional/Welcome Content */}
                    <View style={[styles.leftSide, isDesktop ? styles.leftSideDesktop : styles.leftSideMobile]}>
                        <View style={styles.brandContainer}>
                            <LinearGradient
                                colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                                style={styles.logoPlaceholder}
                            >
                                <Text style={styles.logoIcon}>🌱</Text>
                            </LinearGradient>
                            <Text style={styles.brandName}>Farmer Marketplace</Text>
                        </View>

                        <Text style={styles.welcomeTitle}>
                            Welcome Back, {role.charAt(0).toUpperCase() + role.slice(1)}!
                        </Text>
                        <Text style={styles.welcomeSubtitle}>
                            Access your dashboard, check crop prices, and manage your farm efficiently.
                        </Text>

                        <View style={styles.badgeContainer}>
                            <View style={styles.badge}><Text style={styles.badgeText}>Real-time Prices</Text></View>
                            <View style={styles.badge}><Text style={styles.badgeText}>Government Schemes</Text></View>
                            <View style={styles.badge}><Text style={styles.badgeText}>Secure Payments</Text></View>
                        </View>
                    </View>

                    {/* Right Side - Login Form */}
                    <View style={[styles.rightSide, isDesktop ? styles.rightSideDesktop : styles.rightSideMobile]}>
                        <View style={styles.formCard}>
                            <Text style={styles.loginHeader}>{t('login_header') || 'Login'}</Text>

                            <Text style={styles.label}>{t('select_role') || 'Select Role'}</Text>
                            <View style={styles.roleSelector}>
                                {['farmer', 'buyer'].map((r) => (
                                    <TouchableOpacity
                                        key={r}
                                        style={[
                                            styles.roleButton,
                                            role === r && styles.roleButtonActive
                                        ]}
                                        onPress={() => setRole(r)}
                                    >
                                        <Text style={[
                                            styles.roleText,
                                            role === r && styles.roleTextActive
                                        ]}>
                                            {r.charAt(0).toUpperCase() + r.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <StyledInput
                                label={t('phone_placeholder') || 'Phone Number'}
                                icon="📞"
                                placeholder="Enter your phone number"
                                value={phone}
                                onChangeText={validatePhone}
                                keyboardType="phone-pad"
                                error={phoneError}
                            />

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.primary }}>
                                    {t('password_placeholder') || 'Password'}
                                </Text>
                                <TouchableOpacity>
                                    <Text style={styles.forgotPassword}>{t('forgot_password') || 'Forgot Password?'}</Text>
                                </TouchableOpacity>
                            </View>

                            <StyledInput
                                icon="🔒"
                                placeholder="........"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />

                            <CustomButton
                                title={t('sign_in') || 'Sign In →'}
                                onPress={handleLogin}
                                loading={loading}
                                style={{ marginTop: 24, marginBottom: 24 }}
                            />

                            <View style={styles.registerContainer}>
                                <Text style={styles.registerText}>{t('dont_have_account') || "Don't have an account?"} </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                    <Text style={styles.registerLink}>{t('register_new_farm') || 'Register New Farm'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerDesktop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        height: '100%',
    },

    // Left Side
    leftSide: {
        padding: 24,
        justifyContent: 'center',
    },
    leftSideDesktop: {
        flex: 1,
        maxWidth: 600,
        paddingRight: 60,
    },
    leftSideMobile: {
        alignItems: 'center',
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    logoPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        ...theme.shadows.small,
    },
    logoIcon: {
        fontSize: 24,
    },
    brandName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: theme.colors.text.primary,
        marginBottom: 16,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        lineHeight: 24,
        marginBottom: 32,
    },
    badgeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    badge: {
        backgroundColor: theme.colors.background,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginBottom: 8,
        marginRight: 8,
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    badgeText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },

    // Right Side
    rightSide: {
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightSideDesktop: {
        flex: 1,
        maxWidth: 500,
    },
    rightSideMobile: {
        width: '100%',
    },
    formCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: 32,
        ...theme.shadows.medium,
        width: '100%',
        maxWidth: 450,
    },
    loginHeader: {
        fontSize: theme.typography.h2.fontSize,
        fontWeight: theme.typography.h2.fontWeight,
        marginBottom: 24,
        color: theme.colors.text.primary,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: 8,
        marginTop: 16,
    },
    roleSelector: {
        flexDirection: 'row',
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.m,
        padding: 4,
        marginBottom: 16,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: theme.borderRadius.s,
    },
    roleButtonActive: {
        backgroundColor: theme.colors.surface,
        ...theme.shadows.small,
    },
    roleText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        fontWeight: '500',
    },
    roleTextActive: {
        color: theme.colors.primary,
        fontWeight: '700',
    },
    forgotPassword: {
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    registerText: {
        color: theme.colors.text.secondary,
        fontSize: 14,
    },
    registerLink: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default LoginScreen;
