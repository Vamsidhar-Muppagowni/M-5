const {
    DataTypes
} = require('sequelize');
const sequelize = require('../config/database');

/**
 * ML Model Metadata
 * 
 * Stores metadata about trained ML models such as:
 * - Model type and version
 * - Accuracy metrics
 * - Path to the saved model file (e.g., in S3)
 * Used to track model performance and manage deployments.
 */
const MLModel = sequelize.define('ml_model', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    model_type: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    version: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    accuracy: {
        type: DataTypes.DECIMAL(5, 4), // e.g., 0.9500
        allowNull: true
    },
    trained_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    s3_path: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'ml_models',
    timestamps: false
});

module.exports = MLModel;