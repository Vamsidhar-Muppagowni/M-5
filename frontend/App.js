import 'react-native-gesture-handler';
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

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import LanguageScreen from './src/screens/auth/LanguageScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import OTPVerificationScreen from './src/screens/auth/OTPVerificationScreen';
import FarmerDashboard from './src/screens/farmer/FarmerDashboard';
import BuyerDashboard from './src/screens/buyer/BuyerDashboard';
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
            <Provider store={store}>
                <SafeAreaProvider>
                    <NavigationContainer
                        onReady={() => console.log("Navigation Container Ready")}
                        fallback={<Text>Loading Navigation...</Text>}
                    >
                        <StatusBar style="auto" />
                        <Stack.Navigator initialRouteName="Splash">
                            {/* Auth Stack */}
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

                            {/* Farmer Stack */}
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

                            {/* Buyer Stack */}
                            <Stack.Screen
                                name="BuyerTabs"
                                component={BuyerTabs}
                                options={{ headerShown: false }}
                            />

                            {/* Common Screens */}
                            <Stack.Screen
                                name="VoiceAssistant"
                                component={VoiceAssistant}
                                options={{ headerShown: false }}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </SafeAreaProvider>
            </Provider>
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
