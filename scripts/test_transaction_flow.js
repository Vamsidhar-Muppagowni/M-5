
const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:5000/api';
const FARMER_CREDENTIALS = { phone: '9999999999', password: 'password123' };
const BUYER_CREDENTIALS = { phone: '8888888888', password: 'password123' };

async function testTransactionFlow() {
    try {
        console.log('--- Starting Transaction Flow Test ---');

        // 1. Register/Login Farmer
        console.log('\n1. Registering/Logging in as Farmer...');
        let farmerToken = null;

        try {
            await axios.post(`${API_URL}/auth/register`, {
                ...FARMER_CREDENTIALS,
                name: 'Test Farmer',
                user_type: 'farmer',
                location: { district: 'Guntur' },
                language: 'en'
            });
            console.log('✅ Farmer registered');
        } catch (e) {
            console.log('ℹ️ Farmer already exists or register failed:', e.response?.data?.error || e.message);
        }

        try {
            const farmerLogin = await axios.post(`${API_URL}/auth/login`, FARMER_CREDENTIALS);
            farmerToken = farmerLogin.data.token;
            console.log('✅ Farmer logged in');
        } catch (e) {
            console.error('❌ Farmer login failed:', e.response?.data || e.message);
            return;
        }

        // 2. List a Crop
        console.log('\n2. Listing a crop...');
        let cropId = null;
        const cropData = {
            name: 'Test Crop ' + Date.now(),
            quantity: 100,
            min_price: 1000,
            quality_grade: 'A',
            location: { district: 'Test District' }
        };
        try {
            const listRes = await axios.post(`${API_URL}/market/crops/list`, cropData, {
                headers: { Authorization: `Bearer ${farmerToken}` }
            });
            cropId = listRes.data.crop._id;
            console.log('✅ Crop listed:', cropId);
        } catch (e) {
            console.error('❌ Listing crop failed:', e.response?.data || e.message);
            return;
        }

        // 3. Register/Login Buyer
        console.log('\n3. Registering/Logging in as Buyer...');
        let buyerToken = null;

        try {
            await axios.post(`${API_URL}/auth/register`, {
                ...BUYER_CREDENTIALS,
                name: 'Test Buyer',
                user_type: 'buyer',
                location: { district: 'Nellore' },
                language: 'en'
            });
            console.log('✅ Buyer registered');
        } catch (e) {
            console.log('ℹ️ Buyer already exists or register failed:', e.response?.data?.error || e.message);
        }

        try {
            const buyerLogin = await axios.post(`${API_URL}/auth/login`, BUYER_CREDENTIALS);
            buyerToken = buyerLogin.data.token;
            console.log('✅ Buyer logged in');
        } catch (e) {
            console.error('❌ Buyer login failed:', e.response?.data || e.message);
            return;
        }

        // 4. Place Bid
        console.log('\n4. Placing Bid...');
        let bidId = null;
        const bidAmount = 1200;
        try {
            const bidRes = await axios.post(`${API_URL}/market/bids`, {
                crop_id: cropId,
                amount: bidAmount
            }, {
                headers: { Authorization: `Bearer ${buyerToken}` }
            });
            bidId = bidRes.data.bid._id;
            console.log('✅ Bid placed:', bidId);
        } catch (e) {
            console.error('❌ Placing bid failed:', e.response?.data || e.message);
            return;
        }

        // 5. Accept Bid (Farmer)
        console.log('\n5. Accepting Bid...');
        try {
            await axios.post(`${API_URL}/market/bids/respond`, {
                bid_id: bidId,
                action: 'accept'
            }, {
                headers: { Authorization: `Bearer ${farmerToken}` }
            });
            console.log('✅ Bid accepted');
        } catch (e) {
            console.error('❌ Accepting bid failed:', e.response?.data || e.message);
            return;
        }

        // 6. Create Transaction (Buyer)
        console.log('\n6. Creating Transaction...');
        let txId = null;
        let transaction = null;
        try {
            const txRes = await axios.post(`${API_URL}/transactions`, {
                bid_id: bidId
            }, {
                headers: { Authorization: `Bearer ${buyerToken}` }
            });
            transaction = txRes.data.transaction;
            txId = transaction._id;
            console.log('✅ Transaction created:', txId);
        } catch (e) {
            console.error('❌ Creating transaction failed:', e.response?.data || e.message);
            return;
        }

        // 7. Verify Transaction Pending
        if (transaction.payment_status !== 'pending') {
            throw new Error('Transaction should be pending');
        }

        // 8. Process Payment (Buyer)
        console.log('\n7. Processing Payment...');
        try {
            const payRes = await axios.post(`${API_URL}/transactions/${txId}/pay`, {
                payment_method: 'upi'
            }, {
                headers: { Authorization: `Bearer ${buyerToken}` }
            });
            transaction = payRes.data.transaction;
            console.log('✅ Payment processed');
        } catch (e) {
            console.error('❌ Processing payment failed:', e.response?.data || e.message);
            return;
        }

        // 9. Verify Completed
        if (transaction.payment_status !== 'completed') {
            throw new Error('Transaction should be completed');
        }
        console.log('✅ Transaction status verified as Completed');

        console.log('\n--- Test Passed Successfully! ---');

    } catch (error) {
        console.error('\n❌ Test Failed:', error.response ? error.response.data : error.message);
    }
}

testTransactionFlow();
