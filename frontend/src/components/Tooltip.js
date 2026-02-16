import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { theme } from '../styles/theme';

const Tooltip = ({ text, iconSize = 18, iconColor }) => {
    const [visible, setVisible] = useState(false);
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                onPress={() => setVisible(true)}
                style={styles.iconButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons 
                    name="help-circle-outline" 
                    size={iconSize} 
                    color={iconColor || theme.colors.primary} 
                />
            </TouchableOpacity>

            <Modal
                transparent
                visible={visible}
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <Pressable 
                    style={styles.overlay}
                    onPress={() => setVisible(false)}
                >
                    <View style={styles.tooltipContainer}>
                        <View style={styles.tooltipContent}>
                            <View style={styles.tooltipHeader}>
                                <Ionicons 
                                    name="information-circle" 
                                    size={24} 
                                    color={theme.colors.primary} 
                                />
                                <Text style={styles.tooltipTitle}>{t('info_tooltip') || 'Info'}</Text>
                            </View>
                            <Text style={styles.tooltipText}>{text}</Text>
                            <TouchableOpacity 
                                style={styles.closeButton}
                                onPress={() => setVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>{t('got_it') || 'Got it'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginLeft: 6,
    },
    iconButton: {
        padding: 2,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    tooltipContainer: {
        width: '100%',
        maxWidth: 320,
    },
    tooltipContent: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: 20,
        ...theme.shadows.medium,
    },
    tooltipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    tooltipTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginLeft: 8,
    },
    tooltipText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        lineHeight: 22,
        marginBottom: 16,
    },
    closeButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: theme.borderRadius.m,
        alignSelf: 'flex-end',
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default Tooltip;
