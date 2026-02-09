import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { marketAPI } from '../../services/api';
import SuccessModal from '../../components/SuccessModal';

const CropDetailsScreen = ({ route, navigation }) => {
    const { id } = route.params;
    const [crop, setCrop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState('');
    const [placingBid, setPlacingBid] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        loadDetails();
    }, [id]);

    const loadDetails = async () => {
        try {
            setLoading(true);
            const response = await marketAPI.getCropDetails(id);
            setCrop(response.data.crop);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load details');
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceBid = async () => {
        if (!bidAmount) {
            Alert.alert('Error', 'Enter bid amount');
            return;
        }

        try {
            setPlacingBid(true);
            await marketAPI.placeBid({
                crop_id: id,
                amount: parseFloat(bidAmount)
            });
            setSuccessModalVisible(true);
            setBidAmount('');
            loadDetails(); // Reload to see updated bid count
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to place bid');
        } finally {
            setPlacingBid(false);
        }
    };

    if (loading) return <ActivityIndicator size="large" color="#2e7d32" style={styles.loader} />;
    if (!crop) return <Text>Crop not found</Text>;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{crop.name}</Text>
                <Text style={styles.status}>{crop.status.toUpperCase()}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.priceTag}>Current Price: ₹{crop.current_price}/{crop.unit}</Text>

                <View style={styles.grid}>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>Quantity</Text>
                        <Text style={styles.value}>{crop.quantity} {crop.unit}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>Quality</Text>
                        <Text style={styles.value}>Grade {crop.quality_grade}</Text>
                    </View>
                </View>

                <Text style={styles.label}>Variety</Text>
                <Text style={styles.value}>{crop.variety || 'N/A'}</Text>

                <Text style={styles.label}>Description</Text>
                <Text style={styles.value}>{crop.description || 'No description available.'}</Text>

                <Text style={styles.label}>Location</Text>
                <Text style={styles.value}>{crop.location?.district || 'N/A'}</Text>

                <Text style={styles.label}>Farmer</Text>
                <Text style={styles.value}>{crop.farmer?.name}</Text>
            </View>

            {user?.user_type === 'buyer' && crop.status === 'listed' && (
                <View style={styles.bidSection}>
                    <Text style={styles.sectionTitle}>Place a Bid</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={`Enter amount (Min ₹${crop.min_price})`}
                        value={bidAmount}
                        onChangeText={setBidAmount}
                        keyboardType="numeric"
                    />
                    <TouchableOpacity
                        style={styles.bidButton}
                        onPress={handlePlaceBid}
                        disabled={placingBid}
                    >
                        <Text style={styles.bidButtonText}>
                            {placingBid ? 'Placing Bid...' : 'Place Bid'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <SuccessModal
                visible={successModalVisible}
                title="Bid Placed!"
                message={`You successfully placed a bid of ₹${bidAmount || '---'} for ${crop.name}.`}
                onClose={() => setSuccessModalVisible(false)}
                buttonText="OK"
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    loader: {
        marginTop: 50
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        marginBottom: 10
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333'
    },
    status: {
        fontSize: 14,
        color: '#2e7d32',
        fontWeight: 'bold',
        marginTop: 5
    },
    section: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 10
    },
    priceTag: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 15
    },
    grid: {
        flexDirection: 'row',
        marginBottom: 15
    },
    gridItem: {
        flex: 1
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginTop: 10
    },
    value: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500'
    },
    bidSection: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 20
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16
    },
    bidButton: {
        backgroundColor: '#f57c00',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center'
    },
    bidButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    }
});

export default CropDetailsScreen;
