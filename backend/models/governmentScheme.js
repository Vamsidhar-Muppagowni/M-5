const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GovernmentScheme = sequelize.define('government_scheme', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    eligibility_criteria: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    benefits: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    application_link: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'government_schemes',
    timestamps: false
});

module.exports = GovernmentScheme;
