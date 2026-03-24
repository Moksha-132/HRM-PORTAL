const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Letter = sequelize.define('Letter', {
    letter_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    manager_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Sent', 'Edited'),
        defaultValue: 'Sent'
    }
}, {
    tableName: 'letters',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at' // Enable update tracking for edits
});

module.exports = Letter;
