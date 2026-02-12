import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform, ToastAndroid, KeyboardAvoidingView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { marketAPI } from '../../services/api';
import api from '../../services/api';
import { theme } from '../../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import StyledInput from '../../components/StyledInput';
import SuccessModal from '../../components/SuccessModal';
import { useTranslation } from 'react-i18next';

const CropListingScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        variety: '',
        quantity: '',
        unit: 'kg',
        quality_grade: 'A',
        min_price: '',
        description: '',
        location: {
            district: ''
        }
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [recommendedPrice, setRecommendedPrice] = useState(null);
    const [fetchingPrice, setFetchingPrice] = useState(false);

    const validate = () => {
        let tempErrors = {};
        if (!formData.name) tempErrors.name = t('fill_required');
        if (!formData.quantity) tempErrors.quantity = t('fill_required');
        if (!formData.min_price) tempErrors.min_price = t('fill_required');
        if (!formData.location.district) tempErrors.district = t('fill_required');
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            Alert.alert('Error', t('fill_required'));
            return;
        }

        setLoading(true);

        try {
            console.log("Submitting crop...", formData);

            const payload = {
                ...formData,
                quantity: parseFloat(formData.quantity),
                min_price: parseFloat(formData.min_price),
                // Ensure location is valid
                location: formData.location || { district: 'Unknown' }
            };

            const submitPromise = marketAPI.listCrop(payload);

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), 15000)
            );

            await Promise.race([submitPromise, timeoutPromise]);

            setSuccessModalVisible(true);

        } catch (error) {
            console.error("Submission Error:", error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to list crop. Please try again.';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendedPrice = async () => {
        console.log('🤖 AI Price Suggestion - Starting...');

        if (!formData.name || !formData.quantity || !formData.quality_grade) {
            Alert.alert('Info', 'Please fill crop name, quantity, and quality grade first');
            return;
        }

        setFetchingPrice(true);

        const requestData = {
            crop: formData.name,
            quality: formData.quality_grade,
            location: formData.location.district || 'North',
            quantity: parseFloat(formData.quantity) || 100
        };

        console.log('📤 Sending request to /ml/recommend-price:', requestData);

        try {
            const res = await api.post('/ml/recommend-price', requestData);

            console.log('✅ Response received:', res.data);

            if (res.data && res.data.recommended_price) {
                setRecommendedPrice(res.data.recommended_price);
                setFormData({ ...formData, min_price: res.data.recommended_price.toString() });

                if (Platform.OS === 'android') {
                    ToastAndroid.show(`AI Suggested: ₹${res.data.recommended_price}`, ToastAndroid.SHORT);
                } else {
                    Alert.alert('Success', `AI Suggested Price: ₹${res.data.recommended_price}`);
                }
            } else {
                console.warn('⚠️ No recommended_price in response:', res.data);
                Alert.alert('Info', 'Could not generate price recommendation. Please enter manually.');
            }
        } catch (error) {
            console.error('❌ Failed to fetch recommended price:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config
            });

            let errorMessage = 'Could not fetch price recommendation.';

            if (error.response?.status === 401) {
                errorMessage = 'Authentication required. Please log in again.';
            } else if (error.response?.status === 500) {
                errorMessage = 'Server error. Please try again later.';
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message === 'Network Error') {
                errorMessage = 'Network error. Please check your connection.';
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setFetchingPrice(false);
            console.log('🏁 AI Price Suggestion - Completed');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('list_new_crop')}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('crop_details')}</Text>

                    <StyledInput
                        label={t('crop_name')}
                        placeholder={t('crop_name_placeholder')}
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                        icon="leaf-outline"
                        error={errors.name}
                    />

                    <StyledInput
                        label={t('variety')}
                        placeholder={t('variety_placeholder')}
                        value={formData.variety}
                        onChangeText={(text) => setFormData({ ...formData, variety: text })}
                        icon="pricetag-outline"
                    />

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <StyledInput
                                label={t('quantity')}
                                placeholder="0.00"
                                value={formData.quantity}
                                onChangeText={(text) => setFormData({ ...formData, quantity: text })}
                                keyboardType="numeric"
                                icon="layers-outline"
                                error={errors.quantity}
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>{t('unit')}</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.unit}
                                    onValueChange={(itemValue) => setFormData({ ...formData, unit: itemValue })}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Kg" value="kg" />
                                    <Picker.Item label="Quintal" value="quintal" />
                                    <Picker.Item label="Ton" value="ton" />
                                </Picker>
                            </View>
                        </View>
                    </View>

                    <StyledInput
                        label={t('expected_price')}
                        placeholder={t('min_price_placeholder')}
                        value={formData.min_price}
                        onChangeText={(text) => setFormData({ ...formData, min_price: text })}
                        keyboardType="numeric"
                        icon="cash-outline"
                        error={errors.min_price}
                    />

                    <TouchableOpacity
                        onPress={fetchRecommendedPrice}
                        disabled={fetchingPrice}
                        style={styles.aiButton}
                    >
                        <Ionicons name="sparkles" size={20} color={theme.colors.secondary} />
                        <Text style={styles.aiButtonText}>
                            {fetchingPrice ? 'Getting AI Suggestion...' : '🤖 Get AI Price Suggestion'}
                        </Text>
                    </TouchableOpacity>

                    {recommendedPrice && (
                        <View style={styles.recommendationBox}>
                            <Ionicons name="bulb" size={20} color={theme.colors.success} />
                            <Text style={styles.recommendationText}>
                                Recommended: ₹{recommendedPrice}/quintal
                            </Text>
                        </View>
                    )}

                    <Text style={styles.label}>{t('quality_grade')}</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={formData.quality_grade}
                            onValueChange={(itemValue) => setFormData({ ...formData, quality_grade: itemValue })}
                            style={styles.picker}
                        >
                            <Picker.Item label="Grade A (Best)" value="A" />
                            <Picker.Item label="Grade B (Good)" value="B" />
                            <Picker.Item label="Grade C (Average)" value="C" />
                            <Picker.Item label="Grade D (Low)" value="D" />
                        </Picker>
                    </View>

                    <Text style={styles.label}>{t('description')}</Text>
                    <TextInput
                        style={[styles.textArea, { borderColor: theme.colors.border }]}
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                        multiline
                        numberOfLines={4}
                        placeholder={t('description_placeholder')}
                        placeholderTextColor={theme.colors.text.disabled}
                    />

                    <StyledInput
                        label={t('district')}
                        placeholder={t('district_placeholder')}
                        value={formData.location.district}
                        onChangeText={(text) => setFormData({ ...formData, location: { district: text } })}
                        icon="location-outline"
                        error={errors.district}
                    />
                </View>

                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                        style={styles.button}
                    >
                        {loading ? (
                            <Text style={styles.buttonText}>{t('listing')}</Text>
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="checkmark-circle-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.buttonText}>{t('list_crop_button')}</Text>
                            </View>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <SuccessModal
                    visible={successModalVisible}
                    title={t('crop_listed_success')}
                    message={t('crop_listed_message')}
                    onClose={() => {
                        setSuccessModalVisible(false);
                        navigation.goBack();
                    }}
                    buttonText={t('back_to_dashboard')}
                />

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: theme.colors.surface,
        ...theme.shadows.small,
        zIndex: 10
    },
    backButton: {
        padding: 5
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text.primary
    },
    content: {
        flex: 1,
        padding: 20
    },
    section: {
        marginBottom: 20
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 15
    },
    label: {
        fontSize: 14,
        color: theme.colors.text.primary,
        marginBottom: 8,
        fontWeight: '600'
    },
    textArea: {
        borderWidth: 1,
        borderRadius: theme.borderRadius.m,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: theme.colors.surface,
        height: 100,
        textAlignVertical: 'top',
        color: theme.colors.text.primary
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.m,
        marginBottom: 15,
        backgroundColor: theme.colors.surface,
        overflow: 'hidden'
    },
    picker: {
        height: 50,
        color: theme.colors.text.primary
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    halfInput: {
        width: '48%'
    },
    button: {
        padding: 16,
        borderRadius: theme.borderRadius.l,
        alignItems: 'center',
        marginVertical: 10,
        ...theme.shadows.medium,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    aiButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.secondary + '15',
        padding: 12,
        borderRadius: theme.borderRadius.m,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: theme.colors.secondary,
        gap: 8
    },
    aiButtonText: {
        color: theme.colors.secondary,
        fontSize: 14,
        fontWeight: '600'
    },
    recommendationBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.success + '10',
        padding: 12,
        borderRadius: theme.borderRadius.m,
        marginBottom: 15,
        gap: 8
    },
    recommendationText: {
        color: theme.colors.success,
        fontSize: 14,
        fontWeight: 'bold'
    }
});

export default CropListingScreen;
