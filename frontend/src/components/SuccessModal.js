import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const SuccessModal = ({ visible, title, message, onClose, buttonText = 'Done' }) => {
    const scaleValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(scaleValue, {
                toValue: 1,
                friction: 5,
                useNativeDriver: true
            }).start();
        } else {
            scaleValue.setValue(0);
        }
    }, [visible]);

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleValue }] }]}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} />
                    </View>

                    <Text style={styles.title}>{title || 'Success!'}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <TouchableOpacity onPress={onClose} activeOpacity={0.8} style={styles.buttonContainer}>
                        <LinearGradient
                            colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>{buttonText}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContainer: {
        width: width * 0.85,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: 30,
        alignItems: 'center',
        ...theme.shadows.large
    },
    iconContainer: {
        marginBottom: 20,
        backgroundColor: theme.colors.background,
        borderRadius: 50,
        padding: 10
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 10,
        textAlign: 'center'
    },
    message: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        marginBottom: 30,
        textAlign: 'center',
        lineHeight: 22
    },
    buttonContainer: {
        width: '100%'
    },
    button: {
        paddingVertical: 15,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
        width: '100%'
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    }
});

export default SuccessModal;
