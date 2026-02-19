import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform, ToastAndroid, KeyboardAvoidingView, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { marketAPI } from '../../services/api';
import { theme } from '../../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import StyledInput from '../../components/StyledInput';
import SuccessModal from '../../components/SuccessModal';
import Tooltip from '../../components/Tooltip';
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
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [successModalVisible, setSuccessModalVisible] = useState(false);

    const pickImages = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images.');
                return;
            }

            // Allow multiple image selection
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.7,
                base64: true,
                selectionLimit: 10 - images.length, // Limit based on remaining slots
            });

            if (!result.canceled && result.assets) {
                const newImages = result.assets.map(asset => ({
                    uri: asset.uri,
                    base64: asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri
                }));
                
                const totalImages = [...images, ...newImages];
                if (totalImages.length > 10) {
                    Alert.alert('Limit Exceeded', 'You can upload a maximum of 10 images.');
                    setImages(totalImages.slice(0, 10));
                } else {
                    setImages(totalImages);
                }
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to pick images. Please try again.');
        }
    };

    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                quality: 0.7,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                const newImage = {
                    uri: result.assets[0].uri,
                    base64: result.assets[0].base64 ? `data:image/jpeg;base64,${result.assets[0].base64}` : result.assets[0].uri
                };
                
                if (images.length >= 10) {
                    Alert.alert('Limit Exceeded', 'You can upload a maximum of 10 images.');
                    return;
                }
                setImages([...images, newImage]);
            }
        } catch (error) {
            console.error('Camera error:', error);
            Alert.alert('Error', 'Failed to take photo. Please try again.');
        }
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
    };

    const validate = () => {
        let tempErrors = {};
        if (!formData.name) tempErrors.name = t('fill_required');
        if (!formData.quantity) tempErrors.quantity = t('fill_required');
        if (!formData.min_price) tempErrors.min_price = t('fill_required');
        if (!formData.location.district) tempErrors.district = t('fill_required');
        
        // Price validation - reasonable limits based on unit
        if (formData.min_price) {
            const price = parseFloat(formData.min_price);
            const unit = formData.unit;
            
            // Maximum reasonable prices per unit
            const maxPrices = {
                'kg': 500,      // Max ₹500/kg (e.g., premium spices)
                'quintal': 50000,  // Max ₹50,000/quintal
                'ton': 500000   // Max ₹5,00,000/ton
            };
            
            const maxPrice = maxPrices[unit] || 50000;
            
            if (price > maxPrice) {
                tempErrors.min_price = t('price_too_high') || `Price seems too high. Maximum ₹${maxPrice}/${unit}`;
            }
            
            if (price < 1) {
                tempErrors.min_price = t('price_too_low') || 'Price must be at least ₹1';
            }
        }
        
        // Quantity validation
        if (formData.quantity) {
            const qty = parseFloat(formData.quantity);
            if (qty <= 0) {
                tempErrors.quantity = t('quantity_invalid') || 'Quantity must be greater than 0';
            }
            if (qty > 100000) {
                tempErrors.quantity = t('quantity_too_high') || 'Quantity seems too high';
            }
        }
        
        // Images are optional now
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
                location: formData.location || { district: 'Unknown' },
                // Include images as base64 strings
                images: images.map(img => img.base64)
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

                    {/* Image Upload Section */}
                    <View style={styles.imageSection}>
                        <View style={styles.labelWithTooltip}>
                            <Text style={styles.label}>{t('crop_images') || 'Crop Images'} ({t('optional') || 'Optional'})</Text>
                            <Tooltip text={t('image_tooltip') || 'Upload up to 10 clear photos of your crop. Good photos help buyers make decisions faster and can increase your chances of getting better bids.'} />
                        </View>
                        <Text style={styles.imageSubLabel}>{t('image_count_hint_optional') || `${images.length}/10 images uploaded`}</Text>
                        
                        <View style={styles.imageGrid}>
                            {images.map((image, index) => (
                                <View key={index} style={styles.imageContainer}>
                                    <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                                    <TouchableOpacity 
                                        style={styles.removeImageBtn}
                                        onPress={() => removeImage(index)}
                                    >
                                        <Ionicons name="close-circle" size={24} color={theme.colors.error} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            
                            {images.length < 10 && (
                                <View style={styles.addImageButtons}>
                                    <TouchableOpacity 
                                        style={styles.addImageBtn}
                                        onPress={pickImages}
                                    >
                                        <Ionicons name="images-outline" size={28} color={theme.colors.primary} />
                                        <Text style={styles.addImageText}>{t('gallery') || 'Gallery'}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={styles.addImageBtn}
                                        onPress={takePhoto}
                                    >
                                        <Ionicons name="camera-outline" size={28} color={theme.colors.primary} />
                                        <Text style={styles.addImageText}>{t('camera') || 'Camera'}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        {errors.images && <Text style={styles.errorText}>{errors.images}</Text>}
                    </View>

                    <StyledInput
                        label={t('crop_name')}
                        placeholder={t('crop_name_placeholder')}
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                        icon="leaf-outline"
                        error={errors.name}
                        tooltip={t('crop_name_tooltip') || 'Enter the common name of your crop (e.g., Wheat, Rice, Cotton). This helps buyers find your listing.'}
                    />

                    <StyledInput
                        label={t('variety')}
                        placeholder={t('variety_placeholder')}
                        value={formData.variety}
                        onChangeText={(text) => setFormData({ ...formData, variety: text })}
                        icon="pricetag-outline"
                        tooltip={t('variety_tooltip') || 'Specify the variety or type (e.g., Basmati for rice). Different varieties have different market values.'}
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
                                tooltip={t('quantity_tooltip') || 'Enter the total quantity available for sale. Be accurate as this affects buyer decisions.'}
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
                        tooltip={t('min_price_tooltip') || 'Set the minimum price you are willing to accept per unit. Buyers cannot bid below this amount.'}
                    />

                    <View style={styles.labelWithTooltip}>
                        <Text style={styles.label}>{t('quality_grade')}</Text>
                        <Tooltip text={t('quality_grade_tooltip') !== 'quality_grade_tooltip' ? t('quality_grade_tooltip') : 'Quality grades help buyers understand your crop condition. Grade A: Premium quality with no defects, commands highest prices. Grade B: Good quality with minor imperfections. Grade C: Standard/average quality. Grade D: Basic quality with more defects, lowest prices.'} />
                    </View>
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

                    <View style={styles.labelWithTooltip}>
                        <Text style={styles.label}>{t('description')}</Text>
                        <Tooltip text={t('description_tooltip') || 'Provide details about your crop: growing conditions, harvest date, any certifications, or special characteristics that make your produce stand out.'} />
                    </View>
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
                        tooltip={t('district_tooltip') || 'Enter your district or location. This helps buyers nearby find your crops and plan logistics.'}
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
    labelWithTooltip: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4
    },
    imageSection: {
        marginBottom: 20
    },
    imageSubLabel: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        marginBottom: 12
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10
    },
    imageContainer: {
        position: 'relative',
        width: 100,
        height: 100,
        borderRadius: theme.borderRadius.m,
        overflow: 'hidden'
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        borderRadius: theme.borderRadius.m
    },
    removeImageBtn: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: theme.colors.surface,
        borderRadius: 12
    },
    addImageButtons: {
        flexDirection: 'row',
        gap: 10
    },
    addImageBtn: {
        width: 100,
        height: 100,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        borderStyle: 'dashed',
        borderRadius: theme.borderRadius.m,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surface
    },
    addImageText: {
        fontSize: 12,
        color: theme.colors.primary,
        marginTop: 4,
        fontWeight: '500'
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: 8
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
    }
});

export default CropListingScreen;
