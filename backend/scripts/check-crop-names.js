const mongoose = require('mongoose');
require('dotenv').config();

const checkCropsDetails = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected\n');

        const db = mongoose.connection.db;

        // Get all crops with details
        const allCrops = await db.collection('crops').find({ status: 'listed' })
            .project({ name: 1, quality_grade: 1, current_price: 1, _id: 0 })
            .toArray();

        console.log('📋 All crops in database (status: listed):');
        console.log('='.repeat(60));
        allCrops.forEach((c, i) => {
            console.log(`${i + 1}. Name: "${c.name}", Quality: ${c.quality_grade}, Price: ₹${c.current_price}`);
        });

        await mongoose.connection.close();
        console.log('\n✅ Check complete');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkCropsDetails();
