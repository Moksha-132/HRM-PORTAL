const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

const SuperAdmin = sequelize.define('SuperAdmin', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Please add a name' },
            notEmpty: { msg: 'Please add a name' }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notNull: { msg: 'Please add an email' },
            isEmail: { msg: 'Please add a valid email' }
        }
    },
    role: {
        type: DataTypes.ENUM('Super Admin', 'Admin', 'Company Admin', 'Manager'),
        defaultValue: 'Super Admin'
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Please add a password' },
            len: [6, 100] // password length at least 6
        }
        // To exclude from queries by default, in Sequelize we often exclude it in the controller or use a scope
    }
}, {
    timestamps: true, // adds createdAt and updatedAt
    hooks: {
        beforeCreate: async (admin) => {
            if (admin.password) {
                const salt = await bcrypt.genSalt(10);
                admin.password = await bcrypt.hash(admin.password, salt);
            }
        },
        beforeUpdate: async (admin) => {
            if (admin.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                admin.password = await bcrypt.hash(admin.password, salt);
            }
        }
    }
});

// Match user entered password to hashed password in database
SuperAdmin.prototype.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = SuperAdmin;
