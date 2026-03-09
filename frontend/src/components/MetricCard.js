import React from 'react';
import {
    View,
    Text,
    StyleSheet
} from 'react-native';
import {
    theme
} from '../styles/theme';

const MetricCard = ({
        label,
        value,
        valueColor,
        subtitle,
        containerStyle
    }) => {
        return ( <View style = {
                [styles.card, containerStyle]
            }>
            <Text style = {
                styles.label
            }> {
                label
            } </Text> <Text style = {
                [styles.value, valueColor && {
                    color: valueColor
                }]
            }> {
                value
            } </Text> {
                subtitle ? <Text style = {
                        styles.subtitle
                    }> {
                        subtitle
                    } </Text> : null} </View>
            );
        };

        const styles = StyleSheet.create({
            card: {
                backgroundColor: theme.colors.surface || '#fff',
                borderRadius: theme.borderRadius.m || 12,
                padding: 16,
                alignItems: 'center',
                justifyContent: 'center',
                ...theme.shadows.small,
            },
            label: {
                fontSize: 14,
                fontWeight: 'bold',
                color: theme.colors.text.secondary || '#666',
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 8,
                textAlign: 'center',
            },
            value: {
                fontSize: 20,
                fontWeight: 'bold',
                color: theme.colors.text.primary || '#333',
                textAlign: 'center',
            },
            subtitle: {
                fontSize: 12,
                color: theme.colors.text.secondary || '#666',
                marginTop: 4,
                textAlign: 'center',
            }
        });

        export default MetricCard;