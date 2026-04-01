const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Payroll = sequelize.define('Payroll', {
    payroll_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employee_id: {
        type: DataTypes.INTEGER, // References Employee
        allowNull: false
    },
    basic_salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    allowances: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    deductions: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    net_salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        allowNull: false,
        defaultValue: 'Pending'
    },
    payment_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    }
}, {
    tableName: 'payroll',
    timestamps: false
});

module.exports = Payroll;
