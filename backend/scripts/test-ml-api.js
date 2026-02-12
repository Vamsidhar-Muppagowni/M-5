const axios = require('axios');

const testMLEndpoints = async () => {
    const baseURL = 'http://localhost:5000/api/ml';

    // You'll need to get a valid token first
    // For now, let's test without auth to see the error

    console.log('Testing ML API Endpoints...\n');

    // Test 1: Recommend Price
    console.log('1. Testing /ml/recommend-price');
    try {
        const res = await axios.post(`${baseURL}/recommend-price`, {
            crop: 'Wheat',
            quality: 'A',
            location: 'North',
            quantity: 100
        });
        console.log('✅ Success:', res.data);
    } catch (error) {
        console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
    }

    // Test 2: Market Insights
    console.log('\n2. Testing /ml/insights');
    try {
        const res = await axios.post(`${baseURL}/insights`, {
            crop: 'Wheat',
            location: 'North'
        });
        console.log('✅ Success:', res.data);
    } catch (error) {
        console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
    }

    // Test 3: Crop Recommendation
    console.log('\n3. Testing /ml/recommend-crop');
    try {
        const res = await axios.post(`${baseURL}/recommend-crop`, {
            location: 'North',
            soil_type: 'Loamy',
            water_source: 'irrigation',
            season: 'Kharif'
        });
        console.log('✅ Success:', res.data);
    } catch (error) {
        console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
    }
};

testMLEndpoints();
