const sequelize = require('../config/database');
const { User } = require('../models');

async function verify() {
    console.log('--- Database Verification Script ---');
    console.log(`Checking connection to: ${sequelize.options.dialect}`);

    try {
        await sequelize.authenticate();
        console.log('✅ Connection Successful');

        // Sync check (just a simple query)
        const count = await User.count();
        console.log(`✅ User Model Query Successful. Total Users: ${count}`);

        console.log('--- Verification PASSED ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Verification FAILED:', error.message);
        if (error.original) {
            console.error('   Original Error:', error.original.message);
        }
        process.exit(1);
    }
}

verify();
