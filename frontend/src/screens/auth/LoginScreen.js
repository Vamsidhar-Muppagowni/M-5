import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';

import { useTranslation } from 'react-i18next';

const LoginScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();

    const handleLogin = async () => {
        try {
            if (!phone || !password) {
                Alert.alert('Error', t('error_fill_fields'));
                return;
            }

            const resultAction = await dispatch(login({ phone, password }));
            if (login.fulfilled.match(resultAction)) {
                const user = resultAction.payload.user;
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
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('login')}</Text>

            <TextInput
                style={styles.input}
                placeholder={t('phone_placeholder')}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
            />

            <TextInput
                style={styles.input}
                placeholder={t('password_placeholder')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>{t('login_button')}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.link}>{t('no_account')}</Text>
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
        marginBottom: 30,
        textAlign: 'center',
        color: '#2e7d32'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16
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
    },
    link: {
        marginTop: 20,
        textAlign: 'center',
        color: '#2e7d32',
        fontSize: 16
    }
});

export default LoginScreen;
