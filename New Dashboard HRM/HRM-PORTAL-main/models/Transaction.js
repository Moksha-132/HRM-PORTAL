const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Company = require('./Company');
const Subscription = require('./Subscription');

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Company,
            key: 'id'
        }
    },
    subscriptionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Subscription,
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'USD'
    },
    status: {
        type: DataTypes.ENUM('Success', 'Pending', 'Failed'),
        defaultValue: 'Success'
    },
    transactionDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    nextPaymentDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Setup relationships
Company.hasMany(Transaction, { foreignKey: 'companyId' });
Transaction.belongsTo(Company, { foreignKey: 'companyId' });

Subscription.hasMany(Transaction, { foreignKey: 'subscriptionId' });
Transaction.belongsTo(Subscription, { foreignKey: 'subscriptionId' });

module.exports = Transaction;
