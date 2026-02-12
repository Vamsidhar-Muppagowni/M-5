const axios = require('axios');
const AsyncStorage = require('@react-native-async-storage/async-storage');

// This script simulates testing the ML endpoints with authentication
// Run this to verify the ML API is working

const testMLWithAuth = async () => {
    console.log('🧪 Testing ML API Endpoints with Authentication\n');
    console.log('='.repeat(60));

    const baseURL = 'http://localhost:5000/api';

    // First, let's try to login to get a token
    console.log('\n1️⃣ Attempting to login...');
    try {
        const loginRes = await axios.post(`${baseURL}/auth/login`, {
            email: 'vamsimuppagowni@gmail.com',
            password: 'your_password_here' // You'll need to provide the actual password
        });

        const token = loginRes.data.token;
        console.log('✅ Login successful! Token received.');

        // Create axios instance with auth header
        const authenticatedApi = axios.create({
            baseURL: `${baseURL}/ml`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // Test 1: Recommend Price
        console.log('\n2️⃣ Testing /ml/recommend-price');
        console.log('-'.repeat(60));
        try {
            const res = await authenticatedApi.post('/recommend-price', {
                crop: 'Rice',
                quality: 'A',
                location: 'North',
                quantity: 45
            });
            console.log('✅ Success!');
            console.log('Response:', JSON.stringify(res.data, null, 2));
        } catch (error) {
            console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
        }

        // Test 2: Market Insights
        console.log('\n3️⃣ Testing /ml/insights');
        console.log('-'.repeat(60));
        try {
            const res = await authenticatedApi.post('/insights', {
                crop: 'Wheat',
                location: 'North'
            });
            console.log('✅ Success!');
            console.log('Response:', JSON.stringify(res.data, null, 2));
        } catch (error) {
            console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
        }

        // Test 3: Crop Recommendation
        console.log('\n4️⃣ Testing /ml/recommend-crop');
        console.log('-'.repeat(60));
        try {
            const res = await authenticatedApi.post('/recommend-crop', {
                location: 'North',
                soil_type: 'Loamy',
                water_source: 'irrigation',
                season: 'Kharif'
            });
            console.log('✅ Success!');
            console.log('Response:', JSON.stringify(res.data, null, 2));
        } catch (error) {
            console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ All tests completed!');

    } catch (loginError) {
        console.log('❌ Login failed:', loginError.response?.data || loginError.message);
        console.log('\n⚠️  Cannot test ML endpoints without authentication.');
        console.log('Please update the password in this script and try again.');
    }
};

testMLWithAuth();
