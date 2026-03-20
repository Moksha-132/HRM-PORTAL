const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ChatMessage = sequelize.define('ChatMessage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM('public', 'employee', 'manager', 'admin'),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    response: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    sender_type: {
        type: DataTypes.ENUM('User', 'Bot', 'Admin'),
        allowNull: false,
        defaultValue: 'User'
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Open'
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fileType: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'chat_messages',
    timestamps: false
});

module.exports = ChatMessage;
