import { Platform } from 'react-native';

// Mock implementation for Expo Go since react-native-push-notification requires native build
export const initPushNotifications = () => {
    console.log('[Mock] Push Notifications initialized');
    // real implementation would go here if using expo-notifications or native build
};
