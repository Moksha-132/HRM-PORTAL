const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'employee', 'manager'),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    senderRole: {
        type: DataTypes.ENUM('admin', 'employee', 'manager', 'system'),
        allowNull: true
    },
    senderEmail: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'notifications',
    timestamps: false
});

module.exports = Notification;
