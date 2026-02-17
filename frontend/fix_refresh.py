
import os

files = {
    r"c:\Users\SIDDHARTHA\Desktop\Sem6\SE\Sprint1\M-5\frontend\src\screens\farmer\MyCropsScreen.js": r"""import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { marketAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';

const MyCropsScreen = ({ navigation }) => {
    const { user } = useSelector(state => state.auth);
    const { t } = useTranslation();
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchCrops = async () => {
        if (!user) return;
        try {
            const response = await marketAPI.getCrops({
                farmer_id: user.id,
                status: 'listed'
            });
            if (response.data.crops) {
                setCrops(response.data.crops);
            }
        } catch (error) {
            console.error("Fetch crops error:", error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchCrops();
        setRefreshing(false);
    }, []);

    // Use useFocusEffect to refresh crops when screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchCrops();
        }, [])
    );

    const handleDelete = (cropId) => {
        Alert.alert(
            "Delete Listing",
            "Are you sure you want to remove this crop from the market?",
            [{
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        Alert.alert("Info", "Delete feature coming soon");
                    }
                }
            ]
        );
    };

    const renderCropItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('CropDetails', { cropId: item.id })}
            activeOpacity={0.9}
        >
            <View style={styles.cardHeader}>
                <View style={styles.headerContent}>
                    <View style={styles.iconPlaceholder}>
                        <Text style={styles.iconText}>{item.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.titleContainer}>
                        <Text style={styles.cropName}>{item.name}</Text>
                        <Text style={styles.cropVariety}>{item.variety || 'Standard Variety'}</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'listed' ? '#e8f5e9' : '#fff3e0' }]}>
                    <Ionicons 
                        name={item.status === 'listed' ? 'checkmark-circle' : 'time'}
                        size={12}
                        color={item.status === 'listed' ? '#2e7d32' : '#ef6c00'}
                        style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.statusText, { color: item.status === 'listed' ? '#2e7d32' : '#ef6c00' }]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBody}>
                <View style={styles.infoColumn}>
                    <View style={styles.infoRow}>
                        <Ionicons name="scale-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>{item.quantity} {item.unit}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="pricetag-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>Rs {item.min_price}/{item.unit}</Text>
                    </View>
                </View>
                <View style={styles.infoColumn}>
                    <View style={styles.infoRow}>
                        <Ionicons name="eye-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>{item.view_count || 0} Views</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="hammer-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>{item.bid_count || 0} Bids</Text>
                    </View>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.dateText}>Listed {new Date(item.created_at).toLocaleDateString()}</Text>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash-outline" size={18} color="#d32f2f" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>{t('active_listings')}</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CropListing')}>
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#2e7d32" />
                    <Text style={{ marginTop: 10, color: '#666' }}>Loading your crops...</Text>
                </View>
            ) : (
                <FlatList
                    data={crops}
                    renderItem={renderCropItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#2e7d32']}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconContainer}>
                                <Ionicons name="leaf-outline" size={64} color="#ccc" />
                            </View>
                            <Text style={styles.emptyTitle}>No Active Listings</Text>
                            <Text style={styles.emptyText}>You haven't listed any crops for sale yet.</Text>
                            <TouchableOpacity 
                                style={styles.primaryButton}
                                onPress={() => navigation.navigate('CropListing')}
                            >
                                <Text style={styles.primaryButtonText}>List Your First Crop</Text>
                                <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f5f5f5'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2e7d32'
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2e7d32',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2e7d32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5
    },
    list: {
        padding: 20,
        paddingBottom: 40
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#f0f0f0'
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    iconPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    iconText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2e7d32'
    },
    titleContainer: {
        justifyContent: 'center'
    },
    cropName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
    },
    cropVariety: {
        fontSize: 13,
        color: '#888',
        marginTop: 2
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold'
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 10
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12
    },
    infoColumn: {
        flex: 1
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    infoText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#555',
        fontWeight: '500'
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4
    },
    dateText: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic'
    },
    actionButton: {
        padding: 8,
        backgroundColor: '#ffebee',
        borderRadius: 8
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
        paddingHorizontal: 30
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10
    },
    emptyText: {
        fontSize: 15,
        color: '#888',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22
    },
    primaryButton: {
        flexDirection: 'row',
        backgroundColor: '#2e7d32',
        paddingHorizontal: 25,
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#2e7d32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6
    },
    primaryButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    }
});

export default MyCropsScreen;
""",
    r"c:\Users\SIDDHARTHA\Desktop\Sem6\SE\Sprint1\M-5\frontend\src\screens\farmer\CropListingScreen.js": r"""import React, { useState } from 'react';
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
                        // Navigate back or to MyCrops
                        // navigation.navigate('MyCrops'); // This might be better than goBack if we want to ensure they see it
                        // But MyCrops is in a different stack usually? No, it's pushed.
                        // However, navigation.goBack() is safer general behavior.
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

            <Text style={styles.label}>Expected Price (Rs) *</Text>
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
"""
}

for path, content in files.items():
    print(f"Writing to {path}...")
    try:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Success.")
    except Exception as e:
        print(f"Error: {e}")
