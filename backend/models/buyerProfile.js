const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BuyerProfile = sequelize.define('buyer_profile', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    company_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    gst_number: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    interests: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    status: {
        type: DataTypes.ENUM('active', 'suspended', 'pending'),
        defaultValue: 'active'
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
    tableName: 'buyer_profiles',
    timestamps: false
});

module.exports = BuyerProfile;
