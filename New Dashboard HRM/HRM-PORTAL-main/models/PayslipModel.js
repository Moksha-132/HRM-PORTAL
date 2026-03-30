const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Payslip = sequelize.define('Payslip', {
    payslip_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    payroll_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    basic_salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    allowances: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    deductions: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    net_salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    payment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    pdf_url: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'payslips',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Payslip;
