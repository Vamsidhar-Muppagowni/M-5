const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bid = sequelize.define('bid', {
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
    buyer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'countered', 'expired'),
        defaultValue: 'pending'
    },
    counter_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    negotiation_history: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
    is_highest: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'bids',
    timestamps: false,
    indexes: [
        {
            fields: ['crop_id']
        },
        {
            fields: ['buyer_id']
        },
        {
            fields: ['status']
        }
    ]
});

module.exports = Bid;
