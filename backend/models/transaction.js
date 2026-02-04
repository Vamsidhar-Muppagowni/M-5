const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('transaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    crop_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'crops',
            key: 'id'
        }
    },
    farmer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    buyer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    final_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'pending'
    },
    completed_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'transactions',
    timestamps: false
});

module.exports = Transaction;
