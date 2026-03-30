const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Leave = sequelize.define('Leave', {
    leave_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employee_id: {
        type: DataTypes.INTEGER, // References Employee
        allowNull: false
    },
    leave_type: {
        type: DataTypes.STRING, // e.g., 'Sick', 'Casual', 'Earned'
        allowNull: false
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        defaultValue: 'Pending'
    }
}, {
    tableName: 'leaves',
    timestamps: false
});

module.exports = Leave;
