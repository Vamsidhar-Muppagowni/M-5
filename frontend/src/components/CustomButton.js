import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../styles/theme';

const CustomButton = ({
    onPress,
    title,
    variant = 'primary', // primary, secondary, outline
    loading = false,
    disabled = false,
    style
}) => {
    const getButtonStyle = () => {
        switch (variant) {
            case 'secondary':
                return styles.secondaryButton;
            case 'outline':
                return styles.outlineButton;
            default:
                return styles.primaryButton;
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'secondary':
                return styles.secondaryText;
            case 'outline':
                return styles.outlineText;
            default:
                return styles.primaryText;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                getButtonStyle(),
                disabled && styles.disabledButton,
                style
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? theme.colors.primary : '#fff'} />
            ) : (
                <Text style={[styles.text, getTextStyle()]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120,
        ...theme.shadows.small,
    },
    primaryButton: {
        backgroundColor: theme.colors.primary,
    },
    primaryText: {
        color: '#ffffff',
    },
    secondaryButton: {
        backgroundColor: theme.colors.secondary,
    },
    secondaryText: {
        color: '#ffffff',
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    outlineText: {
        color: theme.colors.primary,
    },
    disabledButton: {
        opacity: 0.6,
        backgroundColor: theme.colors.text.disabled,
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CustomButton;
