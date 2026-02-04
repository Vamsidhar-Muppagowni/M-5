import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { register } from '../../store/slices/authSlice';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';

const RegisterScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        email: '',
        user_type: 'farmer'
    });
    const dispatch = useDispatch();

    const handleRegister = async () => {
        try {
            if (!formData.name || !formData.phone || !formData.password) {
                Alert.alert('Error', t('error_fill_fields'));
                return;
            }

            const resultAction = await dispatch(register(formData));
            if (register.fulfilled.match(resultAction)) {
                Alert.alert('Success', t('success_otp'));
                navigation.navigate('OTPVerification', { phone: formData.phone });
            } else {
                Alert.alert('Registration Failed', resultAction.payload || 'Unknown error');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{t('register')}</Text>

            <TextInput
                style={styles.input}
                placeholder={t('name_placeholder')}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <TextInput
                style={styles.input}
                placeholder={t('phone_placeholder')}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
            />

            <TextInput
                style={styles.input}
                placeholder={t('email_placeholder')}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder={t('password_placeholder')}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry
            />

            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={formData.user_type}
                    onValueChange={(itemValue) => setFormData({ ...formData, user_type: itemValue })}
                >
                    <Picker.Item label={t('farmer_type')} value="farmer" />
                    <Picker.Item label={t('buyer_type')} value="buyer" />
                </Picker>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>{t('register_button')}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>{t('have_account')}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
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
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 15
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

export default RegisterScreen;
