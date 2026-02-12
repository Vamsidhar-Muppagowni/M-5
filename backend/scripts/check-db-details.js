const mongoose = require('mongoose');
require('dotenv').config();

const checkDatabaseDetails = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected\n');

        const db = mongoose.connection.db;

        console.log('🗄️  Database Name:', db.databaseName);
        console.log('🔗 Connection String:', process.env.MONGO_URI.replace(/:[^:@]+@/, ':****@'));
        console.log('\n' + '='.repeat(60) + '\n');

        // Get detailed stats for each collection
        const collections = await db.listCollections().toArray();

        for (const collection of collections) {
            const collName = collection.name;
            const count = await db.collection(collName).countDocuments();

            console.log(`📁 Collection: ${collName}`);
            console.log(`   Documents: ${count}`);

            if (count > 0) {
                // Get first 3 documents
                const docs = await db.collection(collName).find({}).limit(3).toArray();
                console.log(`   Sample IDs: ${docs.map(d => d._id).join(', ')}`);
            }
            console.log('');
        }

        await mongoose.connection.close();
        console.log('✅ Check complete');
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
};

checkDatabaseDetails();
