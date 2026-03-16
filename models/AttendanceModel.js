const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Attendance = sequelize.define('Attendance', {
    attendance_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employee_id: {
        type: DataTypes.INTEGER, // References Employee
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    clock_in: {
        type: DataTypes.DATE,
        allowNull: false
    },
    clock_out: {
        type: DataTypes.DATE,
        allowNull: true
    },
    ip_address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true
    },
    work_duration: {
        type: DataTypes.FLOAT, // In hours or minutes
        allowNull: true
    },
    status: {
        type: DataTypes.STRING, // e.g., 'Present', 'Absent', 'Half Day'
        defaultValue: 'Present'
    }
}, {
    tableName: 'attendance',
    timestamps: false
});

module.exports = Attendance;
