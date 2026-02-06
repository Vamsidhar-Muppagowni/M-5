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
import CustomButton from '../../components/CustomButton';
import StyledInput from '../../components/StyledInput';

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
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={[styles.container, isDesktop && styles.containerDesktop]}>
                <View style={[styles.formCard, isDesktop && styles.formCardDesktop]}>
                    <View style={styles.headerContainer}>
                        <View style={styles.logoPlaceholder}>
                            <Text style={styles.logoIcon}>🌱</Text>
                        </View>
                        <Text style={styles.title}>{t('register')}</Text>
                        <Text style={styles.subtitle}>Join our community of farmers and buyers</Text>
                    </View>

                    <Text style={styles.label}>I am a...</Text>
                    <View style={styles.roleSelector}>
                        {['farmer', 'buyer', 'admin'].map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.roleButton, formData.user_type === type && styles.roleButtonActive]}
                                onPress={() => setFormData({ ...formData, user_type: type })}
                            >
                                <Text style={[styles.roleText, formData.user_type === type && styles.roleTextActive]}>
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
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        padding: 20
    },
    containerDesktop: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    formCardDesktop: {
        maxWidth: 500,
        padding: 40,
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#dcfce7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    logoIcon: {
        fontSize: 28,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    roleSelector: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        padding: 4,
        marginBottom: 24,
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
        color: '#166534',
        fontWeight: '700',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    loginText: {
        color: '#6b7280',
        fontSize: 14,
    },
    loginLink: {
        color: '#166534',
        fontWeight: 'bold',
        fontSize: 14,
    }
});

export default RegisterScreen;
