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
import CustomButton from '../../components/CustomButton';
import StyledInput from '../../components/StyledInput';

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
        <View style={styles.container}>
            <View style={[styles.card, isDesktop && styles.cardDesktop]}>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>🔐</Text>
                </View>

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
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa'
    },
    card: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardDesktop: {
        maxWidth: 450,
        padding: 40,
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10,
    },
    iconContainer: {
        alignSelf: 'center',
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#dcfce7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    icon: {
        fontSize: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 8,
        textAlign: 'center',
        color: '#1a1a1a'
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    phoneText: {
        color: '#1a1a1a',
        fontWeight: 'bold',
    },
    resendButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    resendText: {
        color: '#166534',
        fontSize: 14,
        fontWeight: '600',
    }
});

export default OTPVerificationScreen;
