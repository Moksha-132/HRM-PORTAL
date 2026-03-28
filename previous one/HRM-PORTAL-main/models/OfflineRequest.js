const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OfflineRequest = sequelize.define('OfflineRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    companyName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notNull: true, notEmpty: true }
    },
    contactPerson: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notNull: true, notEmpty: true }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notNull: true, isEmail: true }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notNull: true, notEmpty: true }
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notNull: true, notEmpty: true }
    },
    status: {
        type: DataTypes.ENUM('Pending', 'In Progress', 'Completed', 'Rejected'),
        defaultValue: 'Pending'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

module.exports = OfflineRequest;
