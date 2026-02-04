import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    Image,
    Platform,
    useWindowDimensions,
    ScrollView
} from 'react-native';
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { useTranslation } from 'react-i18next';
// You might need to install vector icons if not available, or use text/images
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 

const LoginScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [role, setRole] = useState('farmer'); // 'farmer', 'buyer', 'admin'
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768; // Simple breakpoint for desktop/tablet

    const handleLogin = async () => {
        try {
            if (!phone || !password) {
                Alert.alert('Error', t('error_fill_fields') || 'Please fill in all fields');
                return;
            }

            // Optional: You might want to pass role to the backend if it supports checking user type
            const resultAction = await dispatch(login({ phone, password }));
            if (login.fulfilled.match(resultAction)) {
                const user = resultAction.payload.user;

                // Simple check to ensure they are logging into the correct interface if needed
                // For now, we trust the backend response or just redirect based on the user type
                if (user.user_type === 'farmer') {
                    navigation.replace('FarmerTabs');
                } else {
                    navigation.replace('BuyerTabs');
                }
            } else {
                Alert.alert('Login Failed', resultAction.payload || 'Unknown error');
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'An unexpected error occurred');
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={[styles.container, isDesktop && styles.containerDesktop]}>
                {/* Left Side - Promotional/Welcome Content */}
                <View style={[styles.leftSide, isDesktop ? styles.leftSideDesktop : styles.leftSideMobile]}>
                    <View style={styles.brandContainer}>
                        {/* Placeholder for Logo - You can replace with actual Image component */}
                        <View style={styles.logoPlaceholder}>
                            <Text style={styles.logoIcon}>🌱</Text>
                        </View>
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
                        <Text style={styles.loginHeader}>Login</Text>

                        <Text style={styles.label}>Select Role</Text>
                        <View style={styles.roleSelector}>
                            {['farmer', 'buyer', 'admin'].map((r) => (
                                <TouchableOpacity
                                    key={r}
                                    style={[styles.roleButton, role === r && styles.roleButtonActive]}
                                    onPress={() => setRole(r)}
                                >
                                    <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                                        {r.charAt(0).toUpperCase() + r.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>{t('phone_placeholder') || 'Phone Number'}</Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputIcon}>📞</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your phone number"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.label}>{t('password_placeholder') || 'Password'}</Text>
                            <TouchableOpacity>
                                <Text style={styles.forgotPassword}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputIcon}>🔒</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="........"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                placeholderTextColor="#999"
                            />
                        </View>

                        <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
                            <Text style={styles.signInButtonText}>Sign In →</Text>
                        </TouchableOpacity>

                        <View style={styles.registerContainer}>
                            <Text style={styles.registerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.registerLink}>Register New Farm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa', // Light background
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
        backgroundColor: '#dcfce7', // Light green
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    logoIcon: {
        fontSize: 24,
    },
    brandName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: '800', // Extra bold
        color: '#1a1a1a',
        marginBottom: 16,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
        marginBottom: 32,
    },
    badgeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    badge: {
        backgroundColor: '#dcfce7', // Light green bg
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginBottom: 8,
        marginRight: 8,
    },
    badgeText: {
        color: '#166534', // Dark green text
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
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        width: '100%',
        maxWidth: 450,
    },
    loginHeader: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#1a1a1a',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        marginTop: 16,
    },
    roleSelector: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        padding: 4,
        marginBottom: 8,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 6,
    },
    roleButtonActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    roleText: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    roleTextActive: {
        color: '#166534', // Green
        fontWeight: '700',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        marginBottom: 8,
    },
    inputIcon: {
        fontSize: 18,
        marginRight: 8,
        color: '#9ca3af',
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1a1a1a',
    },
    forgotPassword: {
        fontSize: 12,
        color: '#166534',
        fontWeight: '600',
    },
    signInButton: {
        backgroundColor: '#166534', // Dark green
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 24,
    },
    signInButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    registerText: {
        color: '#6b7280',
        fontSize: 14,
    },
    registerLink: {
        color: '#166534',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default LoginScreen;
