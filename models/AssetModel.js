const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Asset = sequelize.define('Asset', {
    asset_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    asset_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    asset_category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    assigned_employee: {
        type: DataTypes.INTEGER, // References Employee
        allowNull: true
    },
    serial_number: {
        type: DataTypes.STRING,
        allowNull: true
    },
    assignment_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Available', 'Assigned', 'Returned'),
        defaultValue: 'Available'
    }
}, {
    tableName: 'assets',
    timestamps: false
});

module.exports = Asset;
