const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const IncrementPromotion = sequelize.define('IncrementPromotion', {
    increment_promotion_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    department: {
        type: DataTypes.STRING,
        allowNull: true
    },
    designation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    current_salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    current_role: {
        type: DataTypes.STRING,
        allowNull: true
    },
    joining_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    change_type: {
        type: DataTypes.ENUM('Increment', 'Promotion'),
        allowNull: false
    },
    new_salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    new_designation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    effective_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    performance_rating: {
        type: DataTypes.STRING,
        allowNull: true
    },
    review_period: {
        type: DataTypes.STRING,
        allowNull: true
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        defaultValue: 'Pending'
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
    tableName: 'increment_promotions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = IncrementPromotion;
