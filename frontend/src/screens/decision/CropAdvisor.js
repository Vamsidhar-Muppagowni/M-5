import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { theme } from '../../styles/theme';
import api from '../../services/api'; // Or use mlAPI if imported specifically

const CROP_COLORS = {
    'Rice': { bg: '#E3F2FD', text: '#1565C0', icon: 'water' },
    'Maize': { bg: '#FFF3E0', text: '#E65100', icon: 'nutrition' },
    'Jute': { bg: '#F3E5F5', text: '#6A1B9A', icon: 'leaf' },
    'Cotton': { bg: '#FCE4EC', text: '#B71C1C', icon: 'snow' },
    'Papaya': { bg: '#F9FBE7', text: '#558B2F', icon: 'restaurant' },
    'Orange': { bg: '#FFF8E1', text: '#FF8F00', icon: 'football' },
    'Apple': { bg: '#FFEBEE', text: '#C62828', icon: 'nutrition' },
    'Muskmelon': { bg: '#E8F5E9', text: '#2E7D32', icon: 'ellipse' },
    'Watermelon': { bg: '#E0F2F1', text: '#00695C', icon: 'rose' },
    'Grapes': { bg: '#EDE7F6', text: '#4527A0', icon: 'apps' },
    'Mango': { bg: '#FFFDE7', text: '#F57F17', icon: 'leaf' },
    'Banana': { bg: '#FFF176', text: '#FBC02D', icon: 'moon' },
    'Pomegranate': { bg: '#FCE4EC', text: '#D81B60', icon: 'disc' },
    'Lentil': { bg: '#efebe9', text: '#4e342e', icon: 'hardware-chip' },
    'Blackgram': { bg: '#424242', text: '#FFFFFF', icon: 'beaker' },
    'Mungbean': { bg: '#C8E6C9', text: '#388E3C', icon: 'leaf' },
    'Mothbeans': { bg: '#D7CCC8', text: '#5D4037', icon: 'seed' },
    'Pigeonpeas': { bg: '#FFECB3', text: '#FFA000', icon: 'basket' },
    'Kidneybeans': { bg: '#FFCDD2', text: '#D32F2F', icon: 'egg' },
    'Chickpea': { bg: '#FFE082', text: '#FF8F00', icon: 'flash' },
    'Coffee': { bg: '#D7CCC8', text: '#3E2723', icon: 'cafe' },
    'Coconut': { bg: '#EFEBE9', text: '#3E2723', icon: 'water' },
};

const NumericInput = ({ label, value, onChange, min, max, unit }) => (
    <View style={styles.inputGroup}><Text style={styles.inputLabel}>{label}</Text><View style={styles.inputRow}><TouchableOpacity
                style={styles.stepBtn}
                onPress={() => onChange(Math.max(min, Number(value) - 1))}
            ><Ionicons name="remove" size={16} color={theme.colors.primary} /></TouchableOpacity><TextInput
                style={styles.numericInput}
                value={String(value)}
                onChangeText={(t) =>{
                    const num = parseFloat(t);
                    if (!isNaN(num)) onChange(Math.min(max, Math.max(min, num)));
                }}
                keyboardType="numeric"
            /><TouchableOpacity
                style={styles.stepBtn}
                onPress={() => onChange(Math.min(max, Number(value) + 1))}
            ><Ionicons name="add" size={16} color={theme.colors.primary} /></TouchableOpacity>{unit && <Text style={styles.unitText}>{unit}</Text>}</View></View>
);

const CropAdvisorScreen = ({ navigation }) =>{
    const [loading, setLoading] = useState(false);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [recommendations, setRecommendations] = useState(null);
    const [isFallback, setIsFallback] = useState(false);

    const [form, setForm] = useState({
        temperature: 25,
        humidity: 60,
        rainfall: 100,
        ph: 6.5,
        nitrogen: 40,
        phosphorous: 20,
        potassium: 30,
    });

    const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

    const fetchLiveWeather = async () =>{
        setWeatherLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Allow location access to fetch live weather details.');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            // Fetch live weather from free open-meteo API
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation&hourly=precipitation_probability`;
            const req = await fetch(url);
            const data = await req.json();

            if (data && data.current) {
                setForm(prev => ({
                    ...prev,
                    temperature: data.current.temperature_2m || 25,
                    humidity: data.current.relative_humidity_2m || 60,
                    rainfall: data.current.precipitation || prev.rainfall // Open-meteo gives hourly, so we keep user's or set small default
                }));
                Alert.alert('Weather Synced', `Fetched live temperature (${data.current.temperature_2m}°C) and humidity (${data.current.relative_humidity_2m}%) for your location.`);
            }

        } catch (error) {
            console.error('Weather sync error:', error);
            Alert.alert('Error', 'Unable to fetch live weather conditions.');
        } finally {
            setWeatherLoading(false);
        }
    };

    const handleSubmit = async () =>{
        setLoading(true);
        setRecommendations(null);
        try {
            const res = await api.post('/ml/recommend-crop', form);
            setRecommendations(res.data.recommendations);
            setIsFallback(!!res.data.fallback);
        } catch (err) {
            Alert.alert(
                'Service Unavailable',
                'Could not reach the crop recommendation service. Make sure the ML service is running.'
            );
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank) =>{
        if (rank === 1) return { name: 'trophy', color: '#FFD700' };
        if (rank === 2) return { name: 'medal', color: '#C0C0C0' };
        return { name: 'ribbon', color: '#CD7F32' };
    };

    return (
        <View style={styles.container}><LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.header}
            ><View style={styles.headerContent}><TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity><View><Text style={styles.headerTitle}>Crop Advisor</Text><Text style={styles.headerSubtitle}>Discover the best crop for your soil</Text></View><Ionicons name="leaf" size={24} color="rgba(255,255,255,0.7)" /></View></LinearGradient><ScrollView style={styles.content} showsVerticalScrollIndicator={false}>{/* Weather Data Card */}<View style={[styles.card, { borderColor: '#4FC3F7', borderWidth: 1 }]}><View style={[styles.cardTitleRow, { justifyContent: 'space-between' }]}><View style={{ flexDirection: 'row', alignItems: 'center' }}><Ionicons name="partly-sunny" size={18} color="#0288D1" /><Text style={[styles.cardTitle, { color: '#0288D1' }]}>Live Environment</Text></View><TouchableOpacity style={styles.syncBtn} onPress={fetchLiveWeather} disabled={weatherLoading}>{weatherLoading ? (
                                <ActivityIndicator size="small" color="#0288D1" />
                            ) : (
                                <><Ionicons name="location" size={14} color="#0288D1" /><Text style={styles.syncBtnText}>Get Local</Text></>
                            )}</TouchableOpacity></View><Text style={styles.hint}>Used by ML model to match optimal crop growing conditions</Text><View style={styles.row}><View style={{ flex: 1 }}><NumericInput label="Temperature" value={form.temperature} onChange={set('temperature')} min={5} max={55} unit="°C" /></View><View style={{ width: 12 }} /><View style={{ flex: 1 }}><NumericInput label="Humidity" value={form.humidity} onChange={set('humidity')} min={0} max={100} unit="%" /></View></View><NumericInput label="Avg Rainfall" value={form.rainfall} onChange={set('rainfall')} min={0} max={300} unit="mm" /></View>{/* Soil Data */}<View style={styles.card}><View style={styles.cardTitleRow}><Ionicons name="earth" size={18} color={theme.colors.primary} /><Text style={styles.cardTitle}>Soil Composition (NPK & pH)</Text></View><View style={styles.row}><View style={{ flex: 1 }}><NumericInput label="Nitrogen (N)" value={form.nitrogen} onChange={set('nitrogen')} min={0} max={140} /></View><View style={{ width: 12 }} /><View style={{ flex: 1 }}><NumericInput label="Phosphorous (P)" value={form.phosphorous} onChange={set('phosphorous')} min={0} max={140} /></View></View><View style={styles.row}><View style={{ flex: 1 }}><NumericInput label="Potassium (K)" value={form.potassium} onChange={set('potassium')} min={0} max={200} /></View><View style={{ width: 12 }} /><View style={{ flex: 1 }}><NumericInput label="Soil pH" value={form.ph} onChange={set('ph')} min={0} max={14} unit="pH" /></View></View></View>{/* Submit */}<TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.85}
                >{loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <><Ionicons name="analytics" size={20} color="#fff" style={{ marginRight: 8 }} /><Text style={styles.submitText}>Find Best Crops</Text></>
                    )}</TouchableOpacity>{/* Results */}
                {recommendations && (
                    <View style={styles.resultsSection}><View style={styles.resultsTitleRow}><Ionicons name="sparkles" size={22} color={theme.colors.success} /><Text style={styles.resultsTitle}>Highly Recommended</Text></View>{isFallback && (
                            <View style={styles.fallbackBanner}><Ionicons name="information-circle" size={16} color="#E65100" style={{ marginRight: 6 }} /><Text style={styles.fallbackText}>
                                    Using rule-based system due to offline ML server.
                                </Text></View>
                        )}

                        {recommendations.map((rec) =>{
                            const colors = CROP_COLORS[rec.crop] || { bg: '#E8F5E9', text: '#2E7D32', icon: 'leaf' };
                            const rankIcon = getRankIcon(rec.rank);

                            return (
                                <View key={rec.rank} style={[styles.recCard, { borderLeftColor: colors.text }]}><View style={styles.recHeader}><View style={[styles.recIconBg, { backgroundColor: colors.bg }]}><Ionicons name={colors.icon} size={20} color={colors.text} /></View><View style={{ flex: 1, marginLeft: 12 }}><Text style={[styles.fertilizerName, { color: colors.text }]}>{rec.crop}</Text><Text style={styles.rankLabel}>Rank #{rec.rank}</Text></View><View style={[styles.confidenceBadge, { backgroundColor: colors.bg }]}><Text style={[styles.confidenceText, { color: colors.text }]}>{rec.confidence}% Match
                                            </Text></View></View><View style={styles.barTrack}><View style={[styles.barFill, { width: `${rec.confidence}%`, backgroundColor: colors.text }]} /></View></View>
                            );
                        })}</View>
                )}<View style={{ height: 40 }} /></ScrollView></View>
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

    syncBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E1F5FE', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    syncBtnText: { color: '#0288D1', fontSize: 12, fontWeight: '700', marginLeft: 4 },

    row: { flexDirection: 'row' },
    inputGroup: { marginBottom: 12 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: theme.colors.text.secondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
    inputRow: { flexDirection: 'row', alignItems: 'center' },
    stepBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: theme.colors.primary + '15', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.primary + '30' },
    numericInput: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: theme.colors.text.primary, backgroundColor: theme.colors.background, marginHorizontal: 8, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border },
    unitText: { fontSize: 13, color: theme.colors.text.secondary, marginLeft: 4, minWidth: 28 },
    hint: { fontSize: 12, color: theme.colors.text.secondary, marginBottom: 16, fontStyle: 'italic' },

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
    confidenceText: { fontSize: 12, fontWeight: '700' },
    barTrack: { height: 6, backgroundColor: '#eee', borderRadius: 3, marginBottom: 4 },
    barFill: { height: 6, borderRadius: 3 },
});

export default CropAdvisorScreen;
