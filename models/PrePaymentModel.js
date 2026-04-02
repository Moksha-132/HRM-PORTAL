const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PrePayment = sequelize.define('PrePayment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    payment_type: {
        type: DataTypes.ENUM('Advance', 'Bonus', 'Other'),
        defaultValue: 'Advance'
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        defaultValue: 'Pending'
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    approved_by: {
        type: DataTypes.STRING,
        allowNull: true
    },
    approval_date: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'pre_payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = PrePayment;
