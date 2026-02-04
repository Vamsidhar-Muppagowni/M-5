import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

const StyledInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    keyboardType,
    icon,
    error
}) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[styles.inputContainer, error && styles.inputError]}>
                {icon && <Text style={styles.icon}>{icon}</Text>}
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#9ca3af"
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
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        backgroundColor: '#ffffff',
        paddingHorizontal: 12,
        height: 50,
    },
    inputError: {
        borderColor: '#ef4444',
    },
    icon: {
        fontSize: 18,
        marginRight: 10,
        color: '#9ca3af',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1f2937',
        height: '100%',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
    }
});

export default StyledInput;
