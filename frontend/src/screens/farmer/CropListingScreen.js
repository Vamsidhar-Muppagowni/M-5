import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform, ToastAndroid } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { marketAPI } from '../../services/api';

const CropListingScreen = ({ navigation }) => {
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

    const handleSubmit = async () => {
        if (!formData.name || !formData.quantity || !formData.min_price) {
            Alert.alert('Error', 'Please fill required fields (Name, Quantity, Price)');
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

            if (Platform.OS === 'android') {
                ToastAndroid.show('Crop Listed Successfully!', ToastAndroid.LONG);
            }

            Alert.alert(
                'Success',
                'Your crop has been listed in the market.',
                [{
                    text: 'OK',
                    onPress: () => {
                        navigation.goBack();
                    }
                }]
            );

        } catch (error) {
            console.error("Submission Error:", error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to list crop. Please try again.';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.label}>Crop Name *</Text>
            <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="e.g. Wheat, Rice"
            />

            <Text style={styles.label}>Variety (Optional)</Text>
            <TextInput
                style={styles.input}
                value={formData.variety}
                onChangeText={(text) => setFormData({ ...formData, variety: text })}
                placeholder="e.g. Basmati"
            />

            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <Text style={styles.label}>Quantity *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.quantity}
                        onChangeText={(text) => setFormData({ ...formData, quantity: text })}
                        keyboardType="numeric"
                        placeholder="0.00"
                    />
                </View>
                <View style={styles.halfInput}>
                    <Text style={styles.label}>Unit</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={formData.unit}
                            onValueChange={(itemValue) => setFormData({ ...formData, unit: itemValue })}
                        >
                            <Picker.Item label="Kg" value="kg" />
                            <Picker.Item label="Quintal" value="quintal" />
                            <Picker.Item label="Ton" value="ton" />
                        </Picker>
                    </View>
                </View>
            </View>

            <Text style={styles.label}>Expected Price (₹) *</Text>
            <TextInput
                style={styles.input}
                value={formData.min_price}
                onChangeText={(text) => setFormData({ ...formData, min_price: text })}
                keyboardType="numeric"
                placeholder="Minimum price"
            />

            <Text style={styles.label}>Quality Grade</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={formData.quality_grade}
                    onValueChange={(itemValue) => setFormData({ ...formData, quality_grade: itemValue })}
                >
                    <Picker.Item label="Grade A (Best)" value="A" />
                    <Picker.Item label="Grade B (Good)" value="B" />
                    <Picker.Item label="Grade C (Average)" value="C" />
                    <Picker.Item label="Grade D (Low)" value="D" />
                </Picker>
            </View>

            <Text style={styles.label}>Description</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={4}
                placeholder="Additional details about the crop..."
            />

            <Text style={styles.label}>District *</Text>
            <TextInput
                style={styles.input}
                value={formData.location.district}
                onChangeText={(text) => setFormData({ ...formData, location: { district: text } })}
                placeholder="e.g. Guntur"
            />

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
            >
                <Text style={styles.buttonText}>{loading ? 'Listing...' : 'List Crop'}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff'
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
        fontWeight: '500'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top'
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 15
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    halfInput: {
        width: '48%'
    },
    button: {
        backgroundColor: '#2e7d32',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 20
    },
    buttonDisabled: {
        backgroundColor: '#ccc'
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    }
});

export default CropListingScreen;