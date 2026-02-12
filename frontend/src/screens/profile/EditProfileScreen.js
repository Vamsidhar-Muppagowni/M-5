import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import api from '../../services/api';
import { setUser } from '../../store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditProfileScreen = ({ navigation }) => {
    const { user, token } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [pincodeLoading, setPincodeLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        address_line1: user?.location?.address_line1 || '',
        city: user?.location?.city || '',
        state: user?.location?.state || '',
        pincode: user?.location?.pincode || ''
    });

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'pincode' && value.length === 6) {
            fetchAddressFromPincode(value);
        }
    };

    const fetchAddressFromPincode = async (pincode) => {
        setPincodeLoading(true);
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();

            if (data && data[0].Status === 'Success') {
                const postOffice = data[0].PostOffice[0];
                setFormData(prev => ({
                    ...prev,
                    city: postOffice.District,
                    state: postOffice.State
                }));
            } else {
                // Silently fail or maybe show a small toast? 
                // For now, simple console log, user can still type manually
                console.log("Invalid Pincode");
            }
        } catch (error) {
            console.error("Error fetching pincode details:", error);
        } finally {
            setPincodeLoading(false);
        }
    };

    const handleSave = async () => {
        console.log('💾 Edit Profile - Starting save...');

        if (!formData.name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        setLoading(true);
        try {
            // Construct location object
            const location = {
                address_line1: formData.address_line1,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode
            };

            const updatePayload = {
                name: formData.name,
                location: location
            };

            // Only include email if it has a value (to avoid duplicate key error on null)
            if (formData.email && formData.email.trim()) {
                updatePayload.email = formData.email;
            }

            console.log('📤 Sending update payload:', updatePayload);

            const response = await api.put('/auth/profile', updatePayload);

            console.log('✅ Profile update response:', response.data);

            // Update Redux Store
            const updatedUser = { ...user, ...response.data.user };
            console.log('📝 Updated user object:', updatedUser);

            dispatch(setUser({ user: updatedUser, token }));

            // Update AsyncStorage
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('💾 Saved to AsyncStorage');

            setSuccessMsg('Profile updated successfully!');
            setTimeout(() => {
                navigation.goBack();
            }, 1000);

            // Also keep Alert as backup
            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('❌ Profile update error:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            Alert.alert('Error', error.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
            console.log('🏁 Profile update completed');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('edit_profile') || 'Edit Profile'}</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                        <Text style={styles.saveButton}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            {successMsg ? (
                <View style={{ backgroundColor: theme.colors.success, padding: 10, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{successMsg}</Text>
                </View>
            ) : null}

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>

                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.name}
                        onChangeText={(text) => handleChange('name', text)}
                        placeholder="Enter your full name"
                    />

                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.email}
                        onChangeText={(text) => handleChange('email', text)}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={[styles.input, styles.disabledInput]}
                        value={user?.phone}
                        editable={false}
                    />
                    <Text style={styles.helperText}>Phone number cannot be changed</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Address</Text>

                    <Text style={styles.label}>Address Line 1</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.address_line1}
                        onChangeText={(text) => handleChange('address_line1', text)}
                        placeholder="House No, Street, Landmark"
                    />

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>City/Village</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.city}
                                onChangeText={(text) => handleChange('city', text)}
                                placeholder="City"
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>State</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.state}
                                onChangeText={(text) => handleChange('state', text)}
                                placeholder="State"
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Pincode</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.pincode}
                        onChangeText={(text) => handleChange('pincode', text)}
                        placeholder="Pincode"
                        keyboardType="numeric"
                        maxLength={6}
                    />
                    {pincodeLoading && (
                        <View style={{ position: 'absolute', right: 10, bottom: 25 }}>
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
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
        ...theme.shadows.small
    },
    backButton: {
        padding: 5
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary
    },
    saveButton: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.primary
    },
    content: {
        padding: 20
    },
    section: {
        marginBottom: 30
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 15
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.secondary,
        marginBottom: 8,
        marginLeft: 4
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        color: theme.colors.text.primary,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 15
    },
    disabledInput: {
        backgroundColor: '#f5f5f5',
        color: '#999'
    },
    helperText: {
        fontSize: 12,
        color: theme.colors.text.disabled,
        marginTop: -10,
        marginBottom: 15,
        marginLeft: 4
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    halfInput: {
        width: '48%'
    }
});

export default EditProfileScreen;
