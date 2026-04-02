const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CompanyChatMessage = sequelize.define('CompanyChatMessage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    group_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sender_email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sender_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sender_role: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fileType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    deleted_for_everyone: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    edited_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'company_chat_messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = CompanyChatMessage;
