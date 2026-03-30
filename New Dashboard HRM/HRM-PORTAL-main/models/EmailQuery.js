const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const EmailQuery = sequelize.define('EmailQuery', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notNull: true, notEmpty: true }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notNull: true, isEmail: true }
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notNull: true, notEmpty: true }
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notNull: true, notEmpty: true }
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Resolved'),
        defaultValue: 'Pending'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

module.exports = EmailQuery;
