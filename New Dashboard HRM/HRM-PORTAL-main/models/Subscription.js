const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Company = require('./Company');

const Subscription = sequelize.define('Subscription', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // The foreign key is usually defined automatically by associations, 
    // but we can explicitly define it if needed. We'll set up associations later, 
    // or we can define companyId here.
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Company,
            key: 'id'
        }
    },
    planName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Active', 'Expired', 'Cancelled'),
        defaultValue: 'Active'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Setup relationships
Company.hasMany(Subscription, { foreignKey: 'companyId' });
Subscription.belongsTo(Company, { foreignKey: 'companyId' });

module.exports = Subscription;
