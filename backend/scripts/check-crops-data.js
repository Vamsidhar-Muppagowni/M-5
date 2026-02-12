const mongoose = require('mongoose');
require('dotenv').config();

const checkCropsData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected\n');

        const db = mongoose.connection.db;

        // Check crops by name
        const crops = await db.collection('crops').aggregate([
            { $match: { status: 'listed' } },
            {
                $group: {
                    _id: '$name',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$current_price' },
                    qualities: { $addToSet: '$quality_grade' }
                }
            },
            { $sort: { _id: 1 } }
        ]).toArray();

        console.log('📊 Crops in database (status: listed):');
        console.log('='.repeat(60));
        crops.forEach(c => {
            console.log(`  ${c._id}:`);
            console.log(`    - Listings: ${c.count}`);
            console.log(`    - Avg Price: ₹${c.avgPrice ? c.avgPrice.toFixed(2) : 'N/A'}`);
            console.log(`    - Qualities: ${c.qualities.join(', ')}`);
        });

        // Check price history
        console.log('\n📈 Price History:');
        console.log('='.repeat(60));
        const history = await db.collection('pricehistories').aggregate([
            {
                $group: {
                    _id: '$crop_name',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$price' }
                }
            },
            { $sort: { _id: 1 } }
        ]).toArray();

        history.forEach(h => {
            console.log(`  ${h._id}: ${h.count} records, avg: ₹${h.avgPrice.toFixed(2)}`);
        });

        await mongoose.connection.close();
        console.log('\n✅ Check complete');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkCropsData();
