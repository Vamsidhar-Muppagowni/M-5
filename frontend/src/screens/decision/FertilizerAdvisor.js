import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, TextInput, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { theme } from '../../styles/theme';
import api from '../../services/api';

const SOIL_TYPES = ['Sandy', 'Loamy', 'Black', 'Red', 'Clayey'];
const CROP_TYPES = [
    'Maize', 'Sugarcane', 'Cotton', 'Tobacco', 'Paddy',
    'Barley', 'Wheat', 'Oil seeds', 'Pulses', 'Ground Nuts'
];

const FERTILIZER_COLORS = {
    'Urea': { bg: '#E8F5E9', text: '#2E7D32', icon: 'leaf' },
    'DAP': { bg: '#E3F2FD', text: '#1565C0', icon: 'water' },
    '14-35-14': { bg: '#FFF3E0', text: '#E65100', icon: 'flask' },
    '28-28': { bg: '#F3E5F5', text: '#6A1B9A', icon: 'beaker' },
    '17-17-17': { bg: '#FCE4EC', text: '#B71C1C', icon: 'at-circle' },
    '20-20': { bg: '#E0F7FA', text: '#006064', icon: 'ribbon' },
    '10-26-26': { bg: '#F9FBE7', text: '#558B2F', icon: 'sparkles' },
};

const FERTILIZER_INFO = {
    'Urea': 'High-nitrogen fertilizer (46% N). Best for leafy crops that need lots of nitrogen.',
    'DAP': 'Di-Ammonium Phosphate (18% N, 46% P). Ideal for root development and early growth.',
    '14-35-14': 'High-phosphorous compound. Promotes strong root systems and flowering.',
    '28-28': 'Balanced N-P compound. Good for most crops at seeding stage.',
    '17-17-17': 'Perfectly balanced NPK. Suitable for crops with balanced nutrient needs.',
    '20-20': 'Balanced N-P fertilizer. Good for general crop nutrition.',
    '10-26-26': 'High P-K formula. Promotes fruiting and grain filling stages.',
};

const NumericInput = ({ label, value, onChange, min, max, unit }) => (
    <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.inputRow}>
            <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => onChange(Math.max(min, Number(value) - 1))}
            >
                <Ionicons name="remove" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
            <TextInput
                style={styles.numericInput}
                value={String(value)}
                onChangeText={(t) => {
                    const num = parseFloat(t);
                    if (!isNaN(num)) onChange(Math.min(max, Math.max(min, num)));
                }}
                keyboardType="numeric"
            />
            <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => onChange(Math.min(max, Number(value) + 1))}
            >
                <Ionicons name="add" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
            {unit && <Text style={styles.unitText}>{unit}</Text>}
        </View>
    </View>
);

const FertilizerAdvisor = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState(null);
    const [isFallback, setIsFallback] = useState(false);

    const [form, setForm] = useState({
        temperature: 28,
        humidity: 60,
        moisture: 45,
        nitrogen: 20,
        phosphorous: 15,
        potassium: 10,
        soilType: 'Sandy',
        cropType: 'Maize',
    });

    const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

    const handleSubmit = async () => {
        setLoading(true);
        setRecommendations(null);
        try {
            const res = await api.post('/ml/recommend-fertilizer', form);
            setRecommendations(res.data.recommendations);
            setIsFallback(!!res.data.fallback);
        } catch (err) {
            Alert.alert(
                'Service Unavailable',
                'Could not reach the fertilizer recommendation service. Make sure the ML service is running (python app.py in the ml-service folder).'
            );
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return { name: 'trophy', color: '#FFD700' };
        if (rank === 2) return { name: 'medal', color: '#C0C0C0' };
        return { name: 'ribbon', color: '#CD7F32' };
    };

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
                    <View>
                        <Text style={styles.headerTitle}>Fertilizer Advisor</Text>
                        <Text style={styles.headerSubtitle}>AI-powered recommendations</Text>
                    </View>
                    <Ionicons name="flask" size={24} color="rgba(255,255,255,0.7)" />
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Soil & Crop */}
                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="earth" size={18} color={theme.colors.primary} />
                        <Text style={styles.cardTitle}>Soil & Crop Type</Text>
                    </View>

                    <Text style={styles.inputLabel}>Soil Type</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={form.soilType}
                            onValueChange={set('soilType')}
                            style={styles.picker}
                        >
                            {SOIL_TYPES.map((s) => (
                                <Picker.Item key={s} label={s} value={s} />
                            ))}
                        </Picker>
                    </View>

                    <Text style={[styles.inputLabel, { marginTop: 12 }]}>Crop Type</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={form.cropType}
                            onValueChange={set('cropType')}
                            style={styles.picker}
                        >
                            {CROP_TYPES.map((c) => (
                                <Picker.Item key={c} label={c} value={c} />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Environmental */}
                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="partly-sunny" size={18} color={theme.colors.primary} />
                        <Text style={styles.cardTitle}>Environmental Conditions</Text>
                    </View>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <NumericInput label="Temperature" value={form.temperature} onChange={set('temperature')} min={10} max={50} unit="°C" />
                        </View>
                        <View style={{ width: 12 }} />
                        <View style={{ flex: 1 }}>
                            <NumericInput label="Humidity" value={form.humidity} onChange={set('humidity')} min={0} max={100} unit="%" />
                        </View>
                    </View>
                    <NumericInput label="Moisture" value={form.moisture} onChange={set('moisture')} min={0} max={100} unit="%" />
                </View>

                {/* Nutrients */}
                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="nutrition" size={18} color={theme.colors.primary} />
                        <Text style={styles.cardTitle}>Soil NPK Values</Text>
                    </View>
                    <Text style={styles.hint}>Enter current nutrient levels in your soil (0–100)</Text>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <NumericInput label="Nitrogen (N)" value={form.nitrogen} onChange={set('nitrogen')} min={0} max={100} />
                        </View>
                        <View style={{ width: 12 }} />
                        <View style={{ flex: 1 }}>
                            <NumericInput label="Phosphorous (P)" value={form.phosphorous} onChange={set('phosphorous')} min={0} max={100} />
                        </View>
                    </View>
                    <NumericInput label="Potassium (K)" value={form.potassium} onChange={set('potassium')} min={0} max={100} />
                </View>

                {/* Submit */}
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.85}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="analytics" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.submitText}>Get Fertilizer Recommendation</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Results */}
                {recommendations && (
                    <View style={styles.resultsSection}>
                        <View style={styles.resultsTitleRow}>
                            <Ionicons name="checkmark-circle" size={22} color={theme.colors.success} />
                            <Text style={styles.resultsTitle}>Top 3 Recommendations</Text>
                        </View>

                        {isFallback && (
                            <View style={styles.fallbackBanner}>
                                <Ionicons name="information-circle" size={16} color="#E65100" style={{ marginRight: 6 }} />
                                <Text style={styles.fallbackText}>
                                    ML service offline – using rule-based estimate. Run <Text style={{ fontFamily: 'monospace' }}>python app.py</Text> in ml-service for AI predictions.
                                </Text>
                            </View>
                        )}

                        {recommendations.map((rec) => {
                            const colors = FERTILIZER_COLORS[rec.fertilizer] || { bg: '#F5F5F5', text: '#333', icon: 'flask' };
                            const rankIcon = getRankIcon(rec.rank);
                            const info = FERTILIZER_INFO[rec.fertilizer] || '';
                            return (
                                <View key={rec.rank} style={[styles.recCard, { borderLeftColor: colors.text }]}>
                                    <View style={styles.recHeader}>
                                        <View style={[styles.recIconBg, { backgroundColor: colors.bg }]}>
                                            <Ionicons name={rankIcon.name} size={20} color={rankIcon.color} />
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text style={[styles.fertilizerName, { color: colors.text }]}>
                                                {rec.fertilizer}
                                            </Text>
                                            <Text style={styles.rankLabel}>Rank #{rec.rank}</Text>
                                        </View>
                                        <View style={[styles.confidenceBadge, { backgroundColor: colors.bg }]}>
                                            <Text style={[styles.confidenceText, { color: colors.text }]}>
                                                {rec.confidence}%
                                            </Text>
                                        </View>
                                    </View>
                                    {/* Confidence bar */}
                                    <View style={styles.barTrack}>
                                        <View style={[styles.barFill, { width: `${rec.confidence}%`, backgroundColor: colors.text }]} />
                                    </View>
                                    {info.length > 0 && (
                                        <Text style={styles.recInfo}>{info}</Text>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: theme.borderRadius.l, borderBottomRightRadius: theme.borderRadius.l, ...theme.shadows.medium },
    headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    backButton: { padding: 5 },
    content: { flex: 1, padding: 16 },

    card: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.m, padding: 16, marginBottom: 12, ...theme.shadows.small, borderWidth: 1, borderColor: theme.colors.border },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text.primary, marginLeft: 8 },

    row: { flexDirection: 'row' },
    inputGroup: { marginBottom: 12 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: theme.colors.text.secondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
    inputRow: { flexDirection: 'row', alignItems: 'center' },
    stepBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: theme.colors.primary + '15', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.primary + '30' },
    numericInput: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: theme.colors.text.primary, backgroundColor: theme.colors.background, marginHorizontal: 8, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border },
    unitText: { fontSize: 13, color: theme.colors.text.secondary, marginLeft: 4, minWidth: 28 },
    hint: { fontSize: 12, color: theme.colors.text.secondary, marginBottom: 8, fontStyle: 'italic' },

    pickerWrapper: { backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.m, borderWidth: 1, borderColor: theme.colors.border },
    picker: { color: theme.colors.text.primary },

    submitButton: { flexDirection: 'row', backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.m, paddingVertical: 14, justifyContent: 'center', alignItems: 'center', marginVertical: 16, ...theme.shadows.medium },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    resultsSection: { marginTop: 4 },
    resultsTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    resultsTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text.primary, marginLeft: 8 },
    fallbackBanner: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFF3E0', borderRadius: 8, padding: 10, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#E65100' },
    fallbackText: { fontSize: 12, color: '#BF360C', flex: 1, lineHeight: 18 },

    recCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.m, padding: 14, marginBottom: 12, borderLeftWidth: 4, ...theme.shadows.small, borderWidth: 1, borderColor: theme.colors.border },
    recHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    recIconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    fertilizerName: { fontSize: 17, fontWeight: '800' },
    rankLabel: { fontSize: 12, color: theme.colors.text.secondary, marginTop: 2 },
    confidenceBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    confidenceText: { fontSize: 14, fontWeight: '700' },
    barTrack: { height: 6, backgroundColor: '#eee', borderRadius: 3, marginBottom: 10 },
    barFill: { height: 6, borderRadius: 3 },
    recInfo: { fontSize: 13, color: theme.colors.text.secondary, lineHeight: 18 },
});

export default FertilizerAdvisor;
