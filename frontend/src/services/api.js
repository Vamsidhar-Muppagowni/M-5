import axios from 'axios';
import {
    Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// USB Debugging Mode
// When using 'adb reverse tcp:5000 tcp:5000', the phone can access the PC's localhost directly.
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add token
api.interceptors.request.use(
    async (config) => {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If token expired, try to refresh
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Implement token refresh logic here if backend supports it
                /*
                const refreshToken = await AsyncStorage.getItem('refreshToken');
                if (refreshToken) {
                  const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refreshToken
                  });
                  const { token } = response.data;
                  await AsyncStorage.setItem('token', token);
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                  return api(originalRequest);
                }
                */
                // For now, just logout
                await AsyncStorage.clear();
                return Promise.reject(error);
            } catch (refreshError) {
                // Clear storage and redirect to login
                await AsyncStorage.clear();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;

// API functions for different endpoints
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    verifyOTP: (data) => api.post('/auth/verify-otp', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changeLanguage: (language) => api.put('/auth/language', {
        language
    })
};

export const marketAPI = {
    getCrops: (params) => api.get('/market/crops', {
        params
    }),
    getCropDetails: (id) => api.get(`/market/crops/${id}`),
    listCrop: (data) => api.post('/market/crops/list', data),
    placeBid: (data) => api.post('/market/bids', data),
    respondToBid: (data) => api.post('/market/bids/respond', data),
    getPriceHistory: (params) => api.get('/market/prices/history', {
        params
    }),
    getPendingBids: () => api.get('/market/bids/received')
};

export const mlAPI = {
    getPricePrediction: (data) => api.post('/ml/predict-price', data),
    getMarketInsights: (data) => api.post('/ml/insights', data),
    getCropRecommendation: (data) => api.post('/ml/recommend-crop', data),
    getRecommendedPrice: (data) => api.post('/ml/recommend-price', data)
};

export const governmentAPI = {
    getSchemes: () => api.get('/government/schemes'),
    applyForScheme: (schemeId) => api.post(`/government/schemes/${schemeId}/apply`)
};