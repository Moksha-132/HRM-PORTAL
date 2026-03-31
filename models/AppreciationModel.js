const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Appreciation = sequelize.define('Appreciation', {
    appreciation_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employee_id: {
        type: DataTypes.INTEGER, // Recipient
        allowNull: false
    },
    sender_id: {
        type: DataTypes.INTEGER, // Sender
        allowNull: true
    },
    title: {
        type: DataTypes.STRING, // Badge Name
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT, // Comment
        allowNull: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'appreciations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Appreciation;
