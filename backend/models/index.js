const sequelize = require('../config/database');

// Import all models
const User = require('./user');
const FarmerProfile = require('./farmerProfile');
const BuyerProfile = require('./buyerProfile');
const Crop = require('./crop');
const Bid = require('./bid');
const Transaction = require('./transaction');
const PriceHistory = require('./priceHistory');
const GovernmentScheme = require('./governmentScheme');
const Notification = require('./notification');
const Language = require('./language');
const MLModel = require('./mlModel');

// Define associations
User.hasOne(FarmerProfile, { foreignKey: 'user_id', onDelete: 'CASCADE' });
FarmerProfile.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(BuyerProfile, { foreignKey: 'user_id', onDelete: 'CASCADE' });
BuyerProfile.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Crop, { foreignKey: 'farmer_id' });
Crop.belongsTo(User, { foreignKey: 'farmer_id', as: 'farmer' });

Crop.hasMany(Bid, { foreignKey: 'crop_id' });
Bid.belongsTo(Crop, { foreignKey: 'crop_id' });

User.hasMany(Bid, { foreignKey: 'buyer_id' });
Bid.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' });

Crop.hasOne(Transaction, { foreignKey: 'crop_id' });
Transaction.belongsTo(Crop, { foreignKey: 'crop_id' });

Transaction.belongsTo(User, { foreignKey: 'farmer_id', as: 'farmer' });
Transaction.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' });

User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// Export models
module.exports = {
    sequelize,
    User,
    FarmerProfile,
    BuyerProfile,
    Crop,
    Bid,
    Transaction,
    PriceHistory,
    GovernmentScheme,
    Notification,
    Language,
    MLModel
};
