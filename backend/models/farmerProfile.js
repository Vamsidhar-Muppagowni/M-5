const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FarmerProfile = sequelize.define('farmer_profile', {
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
    farm_size: {
        type: DataTypes.DECIMAL(10, 2),
        comment: 'Farm size in acres'
    },
    land_type: {
        type: DataTypes.ENUM('irrigated', 'rainfed', 'mixed'),
        defaultValue: 'mixed'
    },
    primary_crops: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    experience_years: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    bank_account_number: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    ifsc_code: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    aadhaar_number: {
        type: DataTypes.STRING(12),
        allowNull: true,
        validate: {
            len: [12, 12]
        }
    },
    soil_type: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    water_source: {
        type: DataTypes.ENUM('well', 'canal', 'rain', 'other'),
        allowNull: true
    },
    annual_income: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    family_members: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    education_level: {
        type: DataTypes.ENUM('illiterate', 'primary', 'secondary', 'higher', 'graduate'),
        defaultValue: 'primary'
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
    tableName: 'farmer_profiles',
    timestamps: false
});

module.exports = FarmerProfile;
