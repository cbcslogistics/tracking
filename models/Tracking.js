const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tracking = sequelize.define('Tracking', {
    trackingId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // Ensure tracking ID is unique
    },
    fromAddress: {
        type: DataTypes.STRING,
        allowNull: false
    },
    deliveryAddress: {
        type: DataTypes.STRING,
        allowNull: true // Allow delivery address to be null
    },
    deliveryDate: {
        type: DataTypes.DATE,
        allowNull: true // New delivery date
    },
    fromDate: {
        type: DataTypes.DATE,
        allowNull: false // From date (when the item is sent)
    },
    trackingStatus: {
        type: DataTypes.STRING,
        allowNull: false // New tracking status field
    }
}, {
    timestamps: true
});

const Stopover = sequelize.define('Stopover', {
    stopoverAddress: {
        type: DataTypes.STRING,
        allowNull: false // Stopover address
    },
    stopoverDate: {
        type: DataTypes.DATE,
        allowNull: false // Date of the stopover
    }
});

// Define foreign key relationship
Stopover.belongsTo(Tracking, { foreignKey: 'trackingId', onDelete: 'CASCADE' });
Tracking.hasMany(Stopover, { foreignKey: 'trackingId' });

module.exports = { Tracking, Stopover };
