import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { verifyOTP } from '../../store/slices/authSlice';

const OTPVerificationScreen = ({ route, navigation }) => {
    const { phone } = route.params;
    const [otp, setOtp] = useState('');
    const dispatch = useDispatch();

    const handleVerify = async () => {
        try {
            if (!otp || otp.length !== 6) {
                Alert.alert('Error', 'Please enter valid 6-digit OTP');
                return;
            }

            const resultAction = await dispatch(verifyOTP({ phone, otp }));
            if (verifyOTP.fulfilled.match(resultAction)) {
                Alert.alert('Success', 'Phone verified successfully');
                navigation.navigate('Login');
            } else {
                Alert.alert('Verification Failed', resultAction.payload || 'Invalid OTP');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>Enter OTP sent to {phone}</Text>

            <TextInput
                style={styles.input}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
            />

            <TouchableOpacity style={styles.button} onPress={handleVerify}>
                <Text style={styles.buttonText}>Verify</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#fff'
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#2e7d32'
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 20,
        textAlign: 'center',
        letterSpacing: 5
    },
    button: {
        backgroundColor: '#2e7d32',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    }
});

export default OTPVerificationScreen;
