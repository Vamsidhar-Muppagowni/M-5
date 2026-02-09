import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    useWindowDimensions
} from 'react-native';
import { useDispatch } from 'react-redux';
import { register } from '../../store/slices/authSlice';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from '../../components/CustomButton';
import StyledInput from '../../components/StyledInput';
import { theme } from '../../styles/theme';

const RegisterScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const [loading, setLoading] = useState(false);
    const [secretKey, setSecretKey] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        email: '', // Note: Backend validatos might need to be checked if email is actually used
        user_type: 'farmer'
    });
    const dispatch = useDispatch();

    const handleRegister = async () => {
        try {
            if (!formData.name || !formData.phone || !formData.password) {
                Alert.alert('Error', t('error_fill_fields'));
                return;
            }

            // Security Check for Admin
            if (formData.user_type === 'admin') {
                if (secretKey !== 'ADMIN2026') {
                    Alert.alert('Security Alert', 'Invalid Admin Secret Key. Access Denied.');
                    return;
                }
            }

            setLoading(true);
            const resultAction = await dispatch(register(formData));
            setLoading(false);

            if (register.fulfilled.match(resultAction)) {
                Alert.alert('Success', t('success_otp'));
                navigation.navigate('OTPVerification', { phone: formData.phone });
            } else {
                Alert.alert('Registration Failed', resultAction.payload || 'Unknown error');
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
            Alert.alert('Error', 'An unexpected error occurred');
        }
    };

    return (
        <LinearGradient
            colors={[theme.colors.background, theme.colors.surface]}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={[styles.container, isDesktop && styles.containerDesktop]}>
                    <View style={[styles.formCard, isDesktop && styles.formCardDesktop]}>
                        <View style={styles.headerContainer}>
                            <LinearGradient
                                colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                                style={styles.logoPlaceholder}
                            >
                                <Text style={styles.logoIcon}>🌱</Text>
                            </LinearGradient>
                            <Text style={styles.title}>{t('register')}</Text>
                            <Text style={styles.subtitle}>Join our community of farmers and buyers</Text>
                        </View>

                        <Text style={styles.label}>I am a...</Text>
                        <View style={styles.roleSelector}>
                            {['farmer', 'buyer', 'admin'].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.roleButton,
                                        formData.user_type === type && styles.roleButtonActive
                                    ]}
                                    onPress={() => setFormData({ ...formData, user_type: type })}
                                >
                                    <Text style={[
                                        styles.roleText,
                                        formData.user_type === type && styles.roleTextActive
                                    ]}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {formData.user_type === 'admin' && (
                            <StyledInput
                                label="Admin Secret Key"
                                placeholder="Enter 8-digit secure key"
                                value={secretKey}
                                onChangeText={setSecretKey}
                                icon="shield-checkmark"
                                secureTextEntry={true}
                            />
                        )}

                        <StyledInput
                            label={t('name_placeholder') || 'Full Name'}
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            icon="👤"
                        />

                        <StyledInput
                            label={t('phone_placeholder') || 'Phone Number'}
                            placeholder="Enter your phone number"
                            value={formData.phone}
                            onChangeText={(text) => setFormData({ ...formData, phone: text })}
                            keyboardType="phone-pad"
                            icon="📞"
                        />

                        {/* Including Email even if optional/unused by backend just to match UI if needed */}
                        <StyledInput
                            label={t('email_placeholder') || 'Email Address (Optional)'}
                            placeholder="name@example.com"
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            keyboardType="email-address"
                            icon="✉️"
                        />

                        <StyledInput
                            label={t('password_placeholder') || 'Password'}
                            placeholder="Create a password"
                            value={formData.password}
                            onChangeText={(text) => setFormData({ ...formData, password: text })}
                            secureTextEntry
                            icon="🔒"
                        />

                        <CustomButton
                            title={t('register_button')}
                            onPress={handleRegister}
                            loading={loading}
                            style={{ marginTop: 16 }}
                        />

                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>{t('have_account') || 'Already have an account?'} </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginLink}>Login Here</Text>
                            </TouchableOpacity>
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
        justifyContent: 'center',
        padding: 20
    },
    containerDesktop: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    formCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: 24,
        width: '100%',
        ...theme.shadows.medium,
    },
    formCardDesktop: {
        maxWidth: 500,
        padding: 40,
        ...theme.shadows.large,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        ...theme.shadows.small,
    },
    logoIcon: {
        fontSize: 28,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.colors.text.primary,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: 8,
    },
    roleSelector: {
        flexDirection: 'row',
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.m,
        padding: 4,
        marginBottom: 24,
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
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    loginText: {
        color: theme.colors.text.secondary,
        fontSize: 14,
    },
    loginLink: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: 14,
    }
});

export default RegisterScreen;
