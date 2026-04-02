const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Offboarding = sequelize.define('Offboarding', {
    offboarding_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employee_id: {
        type: DataTypes.INTEGER, // References Employee
        allowNull: false
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('Warning', 'Resignation', 'Complaint'),
        allowNull: false,
        defaultValue: 'Resignation'
    },
    raised_by: {
        type: DataTypes.ENUM('Manager', 'Employee'),
        allowNull: false,
        defaultValue: 'Employee'
    },
    last_working_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Pending', 'In Progress', 'Completed'),
        defaultValue: 'Pending'
    }
}, {
    tableName: 'offboardings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Offboarding;
