const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('notification', {
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
    title: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING(50), // e.g., 'bid', 'system', 'price_alert'
        defaultValue: 'system'
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'notifications',
    timestamps: false
});

module.exports = Notification;
