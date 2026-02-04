const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PriceHistory = sequelize.define('price_history', {
    id: {
        type: DataTypes.INTEGER,
        // Actually SQL said SERIAL PRIMARY KEY
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    crop_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    market_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    quality: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    region: {
        type: DataTypes.STRING(50),
        allowNull: true
    }
}, {
    tableName: 'price_history',
    timestamps: false
});

module.exports = PriceHistory;
