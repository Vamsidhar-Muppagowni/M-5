import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList,
    TouchableOpacity, ScrollView, RefreshControl,
    TextInput
} from 'react-native';
import { governmentAPI } from '../../services/api';
import { theme } from '../../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// ─── Module-level pure helpers ────────────────────────────────────────────────
const safeArr = (v) => (Array.isArray(v) ? v : []);
const safeStr = (v) => (v != null ? String(v) : '');
const itemId = (item) => (item ? safeStr(item._id || item.id || '') : '');
const getSchemeName = (item) => safeStr(item?.name);
const getSchemeDescription = (item) => safeStr(item?.description);
const getSchemeBenefits = (item) => safeStr(item?.benefits);

// ─── Filter options ───────────────────────────────────────────────────────────
const CATEGORY_OPTIONS = ['Subsidy', 'Loan', 'Insurance', 'Income Support'];
const COVERAGE_OPTIONS = ['Central', 'State'];

const GovernmentSchemes = ({ navigation }) => {
    // ── Hooks — stable count, NO useTranslation ────────────────────────────────
    const [schemes, setSchemes] = useState([]);
    const [savedSchemes, setSavedSchemes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    // STEP 1 — filter states
    const [categoryFilters, setCategoryFilters] = useState([]);
    const [coverageFilters, setCoverageFilters] = useState([]);
    // filter panel open/close
    const [filterOpen, setFilterOpen] = useState(true);

    const fetchSchemes = useCallback(async () => {
        try {
            const res = await governmentAPI.getSchemes();
            const data = res?.data;
            setSchemes(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('fetchSchemes error:', e);
            setSchemes([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSchemes(); }, [fetchSchemes]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchSchemes();
        setRefreshing(false);
    }, [fetchSchemes]);

    const toggleBookmark = useCallback((item) => {
        try {
            if (!item) return;
            const id = itemId(item);
            if (!id) return;
            setSavedSchemes(prev => {
                const safe = safeArr(prev);
                const exists = safe.some(s => itemId(s) === id);
                return exists ? safe.filter(s => itemId(s) !== id) : [...safe, item];
            });
        } catch (_) { }
    }, []);

    const isBookmarked = useCallback((item) => {
        try {
            if (!item) return false;
            return safeArr(savedSchemes).some(s => itemId(s) === itemId(item));
        } catch (_) { return false; }
    }, [savedSchemes]);

    // STEP 2 — filter toggle functions
    const toggleCategoryFilter = useCallback((category) => {
        setCategoryFilters(prev => {
            const safe = safeArr(prev);
            return safe.includes(category)
                ? safe.filter(c => c !== category)
                : [...safe, category];
        });
    }, []);

    const toggleCoverageFilter = useCallback((coverage) => {
        setCoverageFilters(prev => {
            const safe = safeArr(prev);
            return safe.includes(coverage)
                ? safe.filter(c => c !== coverage)
                : [...safe, coverage];
        });
    }, []);

    const clearFilters = useCallback(() => {
        setCategoryFilters([]);
        setCoverageFilters([]);
    }, []);

    // ── Guards ────────────────────────────────────────────────────────────────
    if (!Array.isArray(schemes)) return null;
    if (loading && schemes.length === 0) return null;

    const safeQuery = safeStr(searchQuery);
    const safeCatFilters = safeArr(categoryFilters);
    const safeCovFilters = safeArr(coverageFilters);
    const hasActiveFilter = safeCatFilters.length > 0 || safeCovFilters.length > 0;

    // STEP 3 — extended filtering with category + coverage
    const filteredSchemes = safeArr(schemes).filter(scheme => {
        try {
            if (!scheme) return false;
            const name = getSchemeName(scheme).toLowerCase();
            const q = safeQuery.toLowerCase();
            const matchesSearch = name.includes(q);
            const matchesCategory = safeCatFilters.length === 0 || safeCatFilters.includes(safeStr(scheme.category));
            const matchesCoverage = safeCovFilters.length === 0 || safeCovFilters.includes(safeStr(scheme.state));
            const matchesSaved = activeTab === 'saved' ? isBookmarked(scheme) : true;
            return matchesSearch && matchesCategory && matchesCoverage && matchesSaved;
        } catch (_) { return false; }
    });

    const recommendedSchemes = safeArr(schemes).filter(s => {
        try {
            if (!s) return false;
            const cat = safeStr(s.category).toLowerCase();
            const state = safeStr(s.state).toLowerCase();
            return (cat === 'subsidy' || cat === 'insurance') && state === 'central';
        } catch (_) { return false; }
    }).slice(0, 3);

    const savedList = safeArr(savedSchemes);

    // ── Card renderer ─────────────────────────────────────────────────────────
    const renderScheme = ({ item }) => {
        try {
            if (!item) return null;
            const bookmarked = isBookmarked(item);
            return (
                <TouchableOpacity
                    style={styles.card}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('SchemeDetails', { scheme: item })}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="document-text-outline" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.schemeName}>{getSchemeName(item) || 'Scheme'}</Text>
                            <View style={styles.badgeRow}>
                                {safeStr(item.category) ? (
                                    <View style={styles.categoryBadge}>
                                        <Text style={styles.categoryBadgeText}>{safeStr(item.category)}</Text>
                                    </View>
                                ) : null}
                                {safeStr(item.state) ? (
                                    <View style={[styles.categoryBadge, { backgroundColor: theme.colors.secondary + '20' }]}>
                                        <Text style={[styles.categoryBadgeText, { color: theme.colors.secondary }]}>{safeStr(item.state)}</Text>
                                    </View>
                                ) : null}
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => toggleBookmark(item)} style={styles.starBtn}>
                            <Ionicons
                                name={bookmarked ? 'star' : 'star-outline'}
                                size={22}
                                color={bookmarked ? theme.colors.secondary : theme.colors.text.secondary}
                            />
                        </TouchableOpacity>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
                    </View>
                    <View style={styles.divider} />
                    <Text style={styles.description} numberOfLines={3}>{getSchemeDescription(item)}</Text>
                    <View style={styles.benefitsContainer}>
                        <Text style={styles.benefitLabel}>Benefits:</Text>
                        <Text style={styles.benefitValue}>{getSchemeBenefits(item)}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.applyButton}
                        onPress={() => navigation.navigate('SchemeDetails', { scheme: item })}
                    >
                        <Text style={styles.applyButtonText}>View Details & Apply</Text>
                        <Ionicons name="arrow-forward" size={16} color="#fff" />
                    </TouchableOpacity>
                </TouchableOpacity>
            );
        } catch (e) {
            console.error('renderScheme error:', e);
            return null;
        }
    };

    const ListHeader = () => (
        <>
            {/* Search */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                    <TextInput
                        placeholder="Search Schemes..."
                        value={safeQuery}
                        onChangeText={setSearchQuery}
                        style={styles.searchInput}
                        placeholderTextColor={theme.colors.text.secondary}
                    />
                    {safeQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color={theme.colors.text.secondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabBtn, activeTab === 'all' && styles.tabBtnActive]}
                    onPress={() => setActiveTab('all')}
                >
                    <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabBtn, activeTab === 'saved' && styles.tabBtnActive]}
                    onPress={() => setActiveTab('saved')}
                >
                    <Ionicons
                        name={activeTab === 'saved' ? 'star' : 'star-outline'}
                        size={13}
                        color={activeTab === 'saved' ? '#fff' : theme.colors.text.secondary}
                        style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>Saved</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabBtn, { marginLeft: 'auto', flexDirection: 'row' }, hasActiveFilter && styles.tabBtnActive]}
                    onPress={() => setFilterOpen(prev => !prev)}
                >
                    <Ionicons
                        name="options-outline"
                        size={14}
                        color={hasActiveFilter ? '#fff' : theme.colors.text.secondary}
                        style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.tabText, hasActiveFilter && styles.tabTextActive]}>
                        {hasActiveFilter ? `Filters (${safeCatFilters.length + safeCovFilters.length})` : 'Filter'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Filter panel */}
            {filterOpen && (
                <View style={styles.filterPanel}>
                    <View style={styles.filterGroup}>
                        <Text style={styles.filterGroupLabel}>Category</Text>
                        <View style={styles.filterOptions}>
                            {CATEGORY_OPTIONS.map(cat => {
                                const active = safeCatFilters.includes(cat);
                                return (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[styles.filterChip, active && styles.filterChipActive]}
                                        onPress={() => toggleCategoryFilter(cat)}
                                    >
                                        <View style={[styles.checkbox, active && styles.checkboxActive]}>
                                            {active && <Ionicons name="checkmark" size={10} color="#fff" />}
                                        </View>
                                        <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{cat}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                    <View style={styles.filterDivider} />
                    <View style={styles.filterGroup}>
                        <Text style={styles.filterGroupLabel}>Coverage</Text>
                        <View style={styles.filterOptions}>
                            {COVERAGE_OPTIONS.map(cov => {
                                const active = safeCovFilters.includes(cov);
                                return (
                                    <TouchableOpacity
                                        key={cov}
                                        style={[styles.filterChip, active && styles.filterChipActive]}
                                        onPress={() => toggleCoverageFilter(cov)}
                                    >
                                        <View style={[styles.checkbox, active && styles.checkboxActive]}>
                                            {active && <Ionicons name="checkmark" size={10} color="#fff" />}
                                        </View>
                                        <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{cov}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                    {hasActiveFilter && (
                        <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
                            <Ionicons name="close-circle-outline" size={16} color={theme.colors.primary} style={{ marginRight: 6 }} />
                            <Text style={styles.clearBtnText}>Clear Filters</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Saved horizontal strip */}
            {activeTab === 'all' && savedList.length > 0 && (
                <View style={styles.savedSection}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="star" size={20} color={theme.colors.secondary} />
                        <Text style={styles.sectionTitle}>Saved Schemes</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.savedList}>
                        {savedList.map(item => (item ? (
                            <TouchableOpacity
                                key={itemId(item) || Math.random().toString()}
                                style={styles.savedCard}
                                onPress={() => navigation.navigate('SchemeDetails', { scheme: item })}
                            >
                                <View style={styles.savedIconContainer}>
                                    <Ionicons name="document-text" size={20} color={theme.colors.primary} />
                                </View>
                                <Text style={styles.savedSchemeName} numberOfLines={1}>{getSchemeName(item)}</Text>
                                <TouchableOpacity onPress={() => toggleBookmark(item)} style={styles.savedStarButton}>
                                    <Ionicons name="star" size={16} color={theme.colors.secondary} />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ) : null))}
                    </ScrollView>
                </View>
            )}

            {/* Recommended for You */}
            {activeTab === 'all' && !hasActiveFilter && recommendedSchemes.length > 0 && (
                <View style={styles.recommendedSection}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="sparkles" size={18} color={theme.colors.primary} />
                        <Text style={styles.sectionTitle}>Recommended for You</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendedList}>
                        {recommendedSchemes.map(item => (item ? (
                            <TouchableOpacity
                                key={itemId(item) || Math.random().toString()}
                                style={styles.recommendedCard}
                                activeOpacity={0.9}
                                onPress={() => navigation.navigate('SchemeDetails', { scheme: item })}
                            >
                                <View style={styles.recommendedIconRow}>
                                    <View style={styles.recIconContainer}>
                                        <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
                                    </View>
                                    <TouchableOpacity onPress={() => toggleBookmark(item)} style={{ padding: 4 }}>
                                        <Ionicons
                                            name={isBookmarked(item) ? 'star' : 'star-outline'}
                                            size={18}
                                            color={isBookmarked(item) ? theme.colors.secondary : theme.colors.text.secondary}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.recSchemeName} numberOfLines={2}>{getSchemeName(item)}</Text>
                                <View style={styles.recCategoryBadge}>
                                    <Text style={styles.recCategoryText}>{safeStr(item.category)}</Text>
                                </View>
                                <Text style={styles.recBenefits} numberOfLines={2}>{getSchemeBenefits(item)}</Text>
                            </TouchableOpacity>
                        ) : null))}
                    </ScrollView>
                </View>
            )}

            {/* Result count */}
            <View style={styles.resultCountRow}>
                <Text style={styles.resultCount}>
                    {filteredSchemes.length} scheme{filteredSchemes.length !== 1 ? 's' : ''} found
                </Text>
                {hasActiveFilter && (
                    <TouchableOpacity onPress={clearFilters}>
                        <Text style={styles.clearInlineBtn}>Clear</Text>
                    </TouchableOpacity>
                )}
            </View>
        </>
    );

    return (
        <View style={styles.container}>
            {/* Header — stays fixed above the scrollable list */}
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Government Schemes</Text>
                    <View style={{ width: 24 }} />
                </View>
            </LinearGradient>

            {/* FlatList contains everything else so the entire page scrolls */}
            <FlatList
                data={safeArr(filteredSchemes)}
                keyExtractor={item => safeStr(itemId(item) || Math.random())}
                renderItem={renderScheme}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={<ListHeader />}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-outline" size={64} color={theme.colors.text.disabled} />
                            <Text style={styles.emptyText}>
                                {hasActiveFilter ? 'No schemes match your filters' : 'No schemes found'}
                            </Text>
                            {hasActiveFilter && (
                                <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
                                    <Text style={styles.clearBtnText}>Clear Filters</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : null
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: theme.borderRadius.l, borderBottomRightRadius: theme.borderRadius.l, ...theme.shadows.medium },
    headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    backButton: { padding: 5 },

    // Search
    searchContainer: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 5 },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.m, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: theme.colors.border },
    searchInput: { flex: 1, fontSize: 15, color: theme.colors.text.primary, padding: 0 },

    // Tabs
    tabContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10, alignItems: 'center' },
    tabBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, marginRight: 8 },
    tabBtnActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    tabText: { fontSize: 13, fontWeight: '600', color: theme.colors.text.secondary },
    tabTextActive: { color: '#fff' },

    // ── Filter panel (Lenovo style) ───────────────────────────────────────────
    filterPanel: { marginHorizontal: 16, marginBottom: 8, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.m, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 16, paddingVertical: 12, ...theme.shadows.small },
    filterGroup: { marginBottom: 8 },
    filterGroupLabel: { fontSize: 12, fontWeight: '700', color: theme.colors.text.primary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
    filterOptions: { flexDirection: 'row', flexWrap: 'wrap' },
    filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: theme.colors.border, marginRight: 8, marginBottom: 6, backgroundColor: theme.colors.background },
    filterChipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '12' },
    filterChipText: { fontSize: 13, color: theme.colors.text.secondary, marginLeft: 6 },
    filterChipTextActive: { color: theme.colors.primary, fontWeight: '600' },
    checkbox: { width: 14, height: 14, borderRadius: 3, borderWidth: 1.5, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
    checkboxActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    filterDivider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 8 },
    clearBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: 4, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: theme.colors.primary },
    clearBtnText: { fontSize: 13, color: theme.colors.primary, fontWeight: '600' },

    // Result count
    resultCountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 4 },
    resultCount: { fontSize: 12, color: theme.colors.text.secondary },
    clearInlineBtn: { fontSize: 12, color: theme.colors.primary, fontWeight: '600' },

    // Saved strip
    savedSection: { paddingVertical: 10 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text.primary, marginLeft: 8 },
    savedList: { paddingHorizontal: 15 },
    savedCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.m, padding: 12, width: 140, marginHorizontal: 5, ...theme.shadows.small, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
    savedIconContainer: { width: 38, height: 38, borderRadius: 19, backgroundColor: theme.colors.p20, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    savedSchemeName: { fontSize: 12, fontWeight: 'bold', color: theme.colors.text.primary, textAlign: 'center', width: '100%' },
    savedStarButton: { position: 'absolute', top: 6, right: 6 },
    starBtn: { padding: 6, marginRight: 4 },

    // Card badges
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 },
    categoryBadge: { backgroundColor: theme.colors.primary + '18', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginRight: 4, marginTop: 2 },
    categoryBadgeText: { fontSize: 10, color: theme.colors.primary, fontWeight: '600' },

    // Main cards
    list: { padding: 16, paddingTop: 4, paddingBottom: 40 },
    card: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.m, marginBottom: 14, padding: 16, ...theme.shadows.small, borderWidth: 1, borderColor: theme.colors.border },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.p20, justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
    schemeName: { fontSize: 15, fontWeight: 'bold', color: theme.colors.text.primary },
    ministry: { fontSize: 12, color: theme.colors.text.secondary },
    divider: { height: 1, backgroundColor: theme.colors.border, marginBottom: 10 },
    description: { fontSize: 14, color: theme.colors.text.secondary, lineHeight: 20, marginBottom: 10 },
    benefitsContainer: { backgroundColor: '#f0f9f0', padding: 10, borderRadius: 8, marginBottom: 12, flexDirection: 'row', flexWrap: 'wrap' },
    benefitLabel: { fontWeight: 'bold', color: theme.colors.primary, marginRight: 5 },
    benefitValue: { color: theme.colors.text.primary, flex: 1 },
    applyButton: { backgroundColor: theme.colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, borderRadius: theme.borderRadius.m },
    applyButtonText: { color: '#fff', fontWeight: 'bold', marginRight: 8 },

    // Empty
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
    emptyText: { fontSize: 16, color: theme.colors.text.secondary, marginTop: 10, marginBottom: 14 },

    // Recommended
    recommendedSection: { paddingVertical: 10 },
    recommendedList: { paddingHorizontal: 16 },
    recommendedCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.m, padding: 14, width: 200, marginHorizontal: 6, ...theme.shadows.small, borderWidth: 1, borderColor: theme.colors.border },
    recommendedIconRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    recIconContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.p20, justifyContent: 'center', alignItems: 'center' },
    recSchemeName: { fontSize: 13, fontWeight: 'bold', color: theme.colors.text.primary, marginBottom: 6, lineHeight: 18 },
    recCategoryBadge: { alignSelf: 'flex-start', backgroundColor: theme.colors.primary + '18', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 6 },
    recCategoryText: { fontSize: 11, color: theme.colors.primary, fontWeight: '600' },
    recBenefits: { fontSize: 12, color: theme.colors.text.secondary, lineHeight: 16 },
});

export default GovernmentSchemes;
