const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Crop = sequelize.define('crop', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    farmer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    variety: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Quantity in kilograms'
    },
    unit: {
        type: DataTypes.STRING(20),
        defaultValue: 'kg'
    },
    quality_grade: {
        type: DataTypes.ENUM('A', 'B', 'C', 'D'),
        defaultValue: 'B'
    },
    min_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    current_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    location: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {}
    },
    images: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    harvest_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    expiry_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('draft', 'listed', 'reserved', 'sold', 'expired'),
        defaultValue: 'draft'
    },
    bid_end_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    view_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    bid_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
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
    tableName: 'crops',
    timestamps: false,
    indexes: [
        {
            fields: ['status']
        },
        {
            fields: ['farmer_id']
        },
        {
            fields: ['name']
        }
    ]
});

module.exports = Crop;
