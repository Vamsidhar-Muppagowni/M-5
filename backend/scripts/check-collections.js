const mongoose = require('mongoose');
require('dotenv').config();

const checkCollections = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected\n');

        const db = mongoose.connection.db;

        // List all collections
        const collections = await db.listCollections().toArray();
        console.log('📋 Available Collections:');
        console.log(collections.map(c => c.name).join(', '));
        console.log('\n📊 Document Counts:\n');

        // Check document count for each collection
        for (const collection of collections) {
            const count = await db.collection(collection.name).countDocuments();
            console.log(`  ${collection.name}: ${count} documents`);

            // Show sample document if exists
            if (count > 0) {
                const sample = await db.collection(collection.name).findOne();
                console.log(`    Sample: ${JSON.stringify(sample, null, 2).substring(0, 200)}...\n`);
            }
        }

        await mongoose.connection.close();
        console.log('\n✅ Check complete');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkCollections();
