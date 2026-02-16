const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Language = sequelize.define('language', {
    code: {
        type: DataTypes.STRING(10),
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    native_name: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'languages',
    timestamps: false
});

module.exports = Language;
