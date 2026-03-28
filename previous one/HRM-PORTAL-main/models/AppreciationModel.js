const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Appreciation = sequelize.define('Appreciation', {
    appreciation_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employee_id: {
        type: DataTypes.INTEGER, // References Employee
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
}, {
    tableName: 'appreciations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Appreciation;
