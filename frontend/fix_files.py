
import os

files = {
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
            Alert.alert('Error', 'Please fill required fields');
            return;
        }

        setLoading(true);

        try {
            console.log("Submitting crop...", formData);

            const submitPromise = marketAPI.listCrop({
                ...formData,
                quantity: parseFloat(formData.quantity),
                min_price: parseFloat(formData.min_price)
            });

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), 15000)
            );

            await Promise.race([submitPromise, timeoutPromise]);

            if (Platform.OS === 'android') {
                ToastAndroid.show('Crop Listed Successfully!', ToastAndroid.LONG);
            }

            Alert.alert('Success', 'Your crop has been listed in the market.', [{
                text: 'OK',
                onPress: () => navigation.goBack()
            }]);

        } catch (error) {
            console.error("Submission Error:", error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to list crop';
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
""",
    r"c:\Users\SIDDHARTHA\Desktop\Sem6\SE\Sprint1\M-5\frontend\App.js": r"""import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import store
import store from './src/store';
import ErrorBoundary from './src/components/ErrorBoundary';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import LanguageScreen from './src/screens/auth/LanguageScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import OTPVerificationScreen from './src/screens/auth/OTPVerificationScreen';
import FarmerDashboard from './src/screens/farmer/FarmerDashboard';
import BuyerDashboard from './src/screens/buyer/BuyerDashboard';
import AdminDashboard from './src/screens/admin/AdminDashboard';
import MyBidsScreen from './src/screens/buyer/MyBidsScreen';
import CropListingScreen from './src/screens/farmer/CropListingScreen';
import MyCropsScreen from './src/screens/farmer/MyCropsScreen';
import MarketScreen from './src/screens/market/MarketScreen';
import CropDetailsScreen from './src/screens/market/CropDetailsScreen';
import PriceDashboard from './src/screens/decision/PriceDashboard';
import GovernmentSchemes from './src/screens/info/GovernmentSchemes';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import VoiceAssistant from './src/screens/voice/VoiceAssistant';

// Import services
import { initI18n } from './src/services/language';
import { initPushNotifications } from './src/services/notifications';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Farmer Tab Navigator
const FarmerTabs = () => {
    const { t } = useTranslation();
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Market') {
                        iconName = focused ? 'cart' : 'cart-outline';
                    } else if (route.name === 'Prices') {
                        iconName = focused ? 'trending-up' : 'trending-up-outline';
                    } else if (route.name === 'Schemes') {
                        iconName = focused ? 'document-text' : 'document-text-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#2e7d32',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    marginBottom: 5
                }
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={FarmerDashboard}
                options={{ headerShown: false, tabBarLabel: t('dashboard_tab') }}
            />
            <Tab.Screen
                name="Market"
                component={MarketScreen}
                options={{ headerShown: false, tabBarLabel: t('market_tab') }}
            />
            <Tab.Screen
                name="Prices"
                component={PriceDashboard}
                options={{ headerShown: false, tabBarLabel: t('prices_tab') }}
            />
            <Tab.Screen
                name="Schemes"
                component={GovernmentSchemes}
                options={{ headerShown: false, tabBarLabel: t('schemes_tab') }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ headerShown: false, tabBarLabel: t('profile_tab') }}
            />
        </Tab.Navigator>
    );
};

// Buyer Tab Navigator
const BuyerTabs = () => {
    const { t } = useTranslation();
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Browse') {
                        iconName = focused ? 'search' : 'search-outline';
                    } else if (route.name === 'MyBids') {
                        iconName = focused ? 'list' : 'list-outline';
                    } else if (route.name === 'Prices') {
                        iconName = focused ? 'trending-up' : 'trending-up-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#2e7d32',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    marginBottom: 5
                }
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={BuyerDashboard}
                options={{ headerShown: false, tabBarLabel: 'Home' }}
            />
            <Tab.Screen
                name="Browse"
                component={MarketScreen}
                options={{ headerShown: false, tabBarLabel: t('browse_tab') }}
            />
            <Tab.Screen
                name="MyBids"
                component={MyBidsScreen}
                options={{ headerShown: false, tabBarLabel: t('my_bids_tab') }}
            />
            <Tab.Screen
                name="Prices"
                component={PriceDashboard}
                options={{ headerShown: false, tabBarLabel: t('prices_tab') }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ headerShown: false, tabBarLabel: t('profile_tab') }}
            />
        </Tab.Navigator>
    );
};

// Admin Tab Navigator
const AdminTabs = () => {
    const { t } = useTranslation();
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Market') {
                        iconName = focused ? 'cart' : 'cart-outline';
                    } else if (route.name === 'Prices') {
                        iconName = focused ? 'trending-up' : 'trending-up-outline';
                    } else if (route.name === 'Schemes') {
                        iconName = focused ? 'document-text' : 'document-text-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#2e7d32',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    marginBottom: 5
                }
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={AdminDashboard}
                options={{ headerShown: false, tabBarLabel: 'Admin Home' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ headerShown: false, tabBarLabel: t('profile_tab') }}
            />
        </Tab.Navigator>
    );
};

export default function App() {
    console.log("App Component Rendering...");

    useEffect(() => {
        // Initialize services
        try {
            console.log("Initializing services...");
            initI18n();
            initPushNotifications();
            console.log("Services initialized.");
        } catch (e) {
            console.error("Service initialization Error:", e);
        }
    }, []);

    try {
        return (
            <ErrorBoundary>
                <Provider store={store}>
                    <SafeAreaProvider>
                        <NavigationContainer
                            onReady={() => console.log("Navigation Container Ready")}
                            fallback={<Text>Loading Navigation...</Text>}
                        >
                            <StatusBar style="auto" />
                            <Stack.Navigator initialRouteName="Splash">
                                <Stack.Screen
                                    name="Splash"
                                    component={SplashScreen}
                                    options={{ headerShown: false }}
                                />
                                <Stack.Screen
                                    name="Language"
                                    component={LanguageScreen}
                                    options={{ headerShown: false }}
                                />
                                <Stack.Screen
                                    name="Login"
                                    component={LoginScreen}
                                    options={{ headerShown: false }}
                                />
                                <Stack.Screen
                                    name="Register"
                                    component={RegisterScreen}
                                    options={{ headerShown: false }}
                                />
                                <Stack.Screen
                                    name="OTPVerification"
                                    component={OTPVerificationScreen}
                                    options={{ headerShown: false }}
                                />

                                <Stack.Screen
                                    name="FarmerTabs"
                                    component={FarmerTabs}
                                    options={{ headerShown: false }}
                                />
                                <Stack.Screen
                                    name="CropListing"
                                    component={CropListingScreen}
                                    options={{ title: 'List Your Crop' }}
                                />
                                <Stack.Screen
                                    name="CropDetails"
                                    component={CropDetailsScreen}
                                    options={{ title: 'Crop Details' }}
                                />
                                <Stack.Screen
                                    name="MyCrops"
                                    component={MyCropsScreen}
                                    options={{ title: 'My Active Listings' }}
                                />

                                <Stack.Screen
                                    name="BuyerTabs"
                                    component={BuyerTabs}
                                    options={{ headerShown: false }}
                                />

                                <Stack.Screen
                                    name="AdminTabs"
                                    component={AdminTabs}
                                    options={{ headerShown: false }}
                                />

                                <Stack.Screen
                                    name="VoiceAssistant"
                                    component={VoiceAssistant}
                                    options={{ headerShown: false }}
                                />
                            </Stack.Navigator>
                        </NavigationContainer>
                    </SafeAreaProvider>
                </Provider>
            </ErrorBoundary>
        );
    } catch (renderError) {
        console.error("App Render Error:", renderError);
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>App Crashed: {renderError.message}</Text>
            </View>
        );
    }
}
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
