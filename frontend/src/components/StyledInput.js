import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';
import Tooltip from './Tooltip';

const StyledInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    keyboardType,
    icon,
    error,
    tooltip
}) => {
    return (
        <View style={styles.container}>
            {label && (
                <View style={styles.labelRow}>
                    <Text style={styles.label}>{label}</Text>
                    {tooltip && <Tooltip text={tooltip} iconSize={14} />}
                </View>
            )}
            <View style={[styles.inputContainer, error && styles.inputError]}>
                {icon && <Text style={styles.icon}>{icon}</Text>}
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.text.disabled}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width: '100%',
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.m,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 12,
        height: 50,
        ...theme.shadows.small,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    icon: {
        fontSize: 18,
        marginRight: 10,
        color: theme.colors.text.disabled,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.text.primary,
        height: '100%',
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: 4,
    }
});

export default StyledInput;
