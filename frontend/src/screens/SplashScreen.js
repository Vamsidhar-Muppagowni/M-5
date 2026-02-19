import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slices/authSlice';

const SplashScreen = ({ navigation }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        checkLogin();
    }, []);

    const checkLogin = async () => {
        try {
            console.log('[Splash] Checking AsyncStorage...');
            const token = await AsyncStorage.getItem('token');
            const userStr = await AsyncStorage.getItem('user');

            console.log('[Splash] Token:', !!token, 'User:', !!userStr);

            if (token && userStr) {
                try {
                    const user = JSON.parse(userStr);
                    console.log('[Splash] Disposing user to Redux...');
                    dispatch(setUser({ user, token }));

                    console.log('[Splash] User Type:', user.user_type);
                    if (user.user_type === 'farmer') {
                        console.log('[Splash] Navigating to FarmerTabs');
                        navigation.replace('FarmerTabs');
                    } else {
                        console.log('[Splash] Navigating to BuyerTabs');
                        navigation.replace('BuyerTabs');
                    }
                } catch (parseError) {
                    console.error('[Splash] JSON Parse Error:', parseError);
                    console.log('[Splash] Clearing storage and navigating to Language');
                    await AsyncStorage.clear();
                    navigation.replace('Language');
                }
            } else {
                console.log('[Splash] No credentials. Navigating to Language');
                navigation.replace('Language');
            }
        } catch (e) {
            console.error('[Splash] Auth Check Error:', e);
            navigation.replace('Language');
        }
    };

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#2e7d32" />
            <Text style={styles.text}>FarmMarket</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    text: {
        marginTop: 20,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2e7d32'
    }
});

export default SplashScreen;
