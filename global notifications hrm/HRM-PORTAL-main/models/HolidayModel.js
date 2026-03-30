const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Holiday = sequelize.define('Holiday', {
    holiday_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    holiday_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'holidays',
    timestamps: false
});

module.exports = Holiday;
