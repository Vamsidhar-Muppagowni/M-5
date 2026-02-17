import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { governmentAPI } from '../../services/api';
import { theme } from '../../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const GovernmentSchemes = ({ navigation }) => {
    const { t } = useTranslation();
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchSchemes = async () => {
        try {
            const res = await governmentAPI.getSchemes();
            if (res.data) {
                setSchemes(res.data);
            }
        } catch (error) {
            console.error("Error fetching schemes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchemes();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchSchemes();
        setRefreshing(false);
    };

    const handleNavigateToDetails = (item) => {
        navigation.navigate('SchemeDetails', { scheme: item });
    };

    // Get translated scheme content based on scheme name
    const getSchemeName = (item) => {
        if (item.name === 'PM-KISAN') return t('pmkisan_name') || item.name;
        if (item.name === 'KCC') return t('kcc_name') || item.name;
        return item.name;
    };

    const getSchemeDescription = (item) => {
        if (item.name === 'PM-KISAN') return t('pmkisan_description') || item.description;
        if (item.name === 'KCC') return t('kcc_description') || item.description;
        return item.description;
    };

    const getSchemeBenefits = (item) => {
        if (item.name === 'PM-KISAN') return t('pmkisan_benefits') || item.benefits;
        if (item.name === 'KCC') return t('kcc_benefits') || item.benefits;
        return item.benefits;
    };

    const renderScheme = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => handleNavigateToDetails(item)}
        >
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <Ionicons name="document-text-outline" size={24} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.schemeName}>{getSchemeName(item)}</Text>
                    <Text style={styles.ministry}>{t('ministry_agriculture')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
            </View>

            <View style={styles.divider} />

            <Text style={styles.description} numberOfLines={3}>{getSchemeDescription(item)}</Text>

            <View style={styles.benefitsContainer}>
                <Text style={styles.benefitLabel}>{t('benefits_label')}</Text>
                <Text style={styles.benefitValue}>{getSchemeBenefits(item)}</Text>
            </View>

            <TouchableOpacity style={styles.applyButton} onPress={() => handleNavigateToDetails(item)}>
                <Text style={styles.applyButtonText}>{t('view_details_apply')}</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('government_schemes')}</Text>
                    <View style={{ width: 24 }} />
                </View>
            </LinearGradient>

            <FlatList
                data={schemes}
                keyExtractor={item => (item.id || item._id || '').toString()}
                renderItem={renderScheme}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-outline" size={64} color={theme.colors.text.disabled} />
                            <Text style={styles.emptyText}>{t('no_schemes')}</Text>
                        </View>
                    )
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: theme.borderRadius.l,
        borderBottomRightRadius: theme.borderRadius.l,
        ...theme.shadows.medium
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff'
    },
    backButton: {
        padding: 5
    },
    list: {
        padding: 20,
        paddingBottom: 40
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        marginBottom: 16,
        padding: 16,
        ...theme.shadows.small,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.p20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    schemeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 2
    },
    ministry: {
        fontSize: 12,
        color: theme.colors.text.secondary
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginBottom: 12
    },
    description: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        lineHeight: 20,
        marginBottom: 12
    },
    benefitsContainer: {
        backgroundColor: '#f0f9f0',
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    benefitLabel: {
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginRight: 5
    },
    benefitValue: {
        color: theme.colors.text.primary,
        flex: 1
    },
    applyButton: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: theme.borderRadius.m
    },
    applyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginRight: 8
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60
    },
    emptyText: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        marginTop: 10
    }
});

export default GovernmentSchemes;
