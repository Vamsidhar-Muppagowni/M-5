import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    useWindowDimensions
} from 'react-native';
import { useDispatch } from 'react-redux';
import { verifyOTP } from '../../store/slices/authSlice';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from '../../components/CustomButton';
import StyledInput from '../../components/StyledInput';
import { theme } from '../../styles/theme';

const OTPVerificationScreen = ({ route, navigation }) => {
    const { phone } = route.params;
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;

    const handleVerify = async () => {
        try {
            if (!otp || otp.length !== 6) {
                Alert.alert('Error', 'Please enter valid 6-digit OTP');
                return;
            }

            setLoading(true);
            const resultAction = await dispatch(verifyOTP({ phone, otp }));
            setLoading(false);

            if (verifyOTP.fulfilled.match(resultAction)) {
                Alert.alert('Success', 'Phone verified successfully');
                navigation.navigate('Login');
            } else {
                Alert.alert('Verification Failed', resultAction.payload || 'Invalid OTP');
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
            <View style={styles.container}>
                <View style={[styles.card, isDesktop && styles.cardDesktop]}>
                    <LinearGradient
                        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                        style={styles.iconContainer}
                    >
                        <Text style={styles.icon}>🔐</Text>
                    </LinearGradient>

                    <Text style={styles.title}>Verify OTP</Text>
                    <Text style={styles.subtitle}>
                        We've sent a 6-digit verification code to
                        {'\n'}
                        <Text style={styles.phoneText}>{phone}</Text>
                    </Text>

                    <StyledInput
                        placeholder="000000"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        icon="🔢"
                        style={{ textAlign: 'center', letterSpacing: 5, fontSize: 24 }}
                    />

                    <CustomButton
                        title="Verify Code"
                        onPress={handleVerify}
                        loading={loading}
                        style={{ marginTop: 16 }}
                    />

                    <TouchableOpacity
                        style={styles.resendButton}
                        onPress={() => Alert.alert('Info', 'Resend feature coming soon')}
                    >
                        <Text style={styles.resendText}>Didn't receive code? Resend</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '100%',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: 24,
        ...theme.shadows.medium,
    },
    cardDesktop: {
        maxWidth: 450,
        padding: 40,
        ...theme.shadows.large,
    },
    iconContainer: {
        alignSelf: 'center',
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        ...theme.shadows.small,
    },
    icon: {
        fontSize: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 8,
        textAlign: 'center',
        color: theme.colors.text.primary,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    phoneText: {
        color: theme.colors.text.primary,
        fontWeight: 'bold',
    },
    resendButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    resendText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '600',
    }
});

export default OTPVerificationScreen;
