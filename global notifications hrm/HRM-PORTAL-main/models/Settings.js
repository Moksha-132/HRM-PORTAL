const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const WebsiteSetting = sequelize.define('WebsiteSetting', {
    siteName: DataTypes.STRING,
    logoUrl: DataTypes.STRING,
    faviconUrl: DataTypes.STRING,
    footerText: DataTypes.STRING
}, { timestamps: true });

const HeaderSetting = sequelize.define('HeaderSetting', {
    title: { type: DataTypes.STRING, allowNull: false },
    subtitle: DataTypes.STRING,
    description: DataTypes.TEXT,
    backgroundImage: DataTypes.STRING, // URL or path
    buttonText: DataTypes.STRING,
    buttonLink: DataTypes.STRING,
    showButton: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { timestamps: true });

const AboutSetting = sequelize.define('AboutSetting', {
    title: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    mission: DataTypes.TEXT,
    vision: DataTypes.TEXT
}, { timestamps: true });

const Testimonial = sequelize.define('Testimonial', {
    clientName: { type: DataTypes.STRING, allowNull: false },
    feedback: { type: DataTypes.TEXT, allowNull: false },
    rating: {
        type: DataTypes.INTEGER,
        validate: { min: 1, max: 5 }
    },
    clientImage: DataTypes.STRING
}, { timestamps: true });

const Feature = sequelize.define('Feature', {
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    icon: DataTypes.STRING
}, { timestamps: true });

const Pricing = sequelize.define('Pricing', {
    planName: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    features: DataTypes.JSON, // PostgreSQL supports JSON out of the box
    isPopular: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: true });

const FAQ = sequelize.define('FAQ', {
    question: { type: DataTypes.STRING, allowNull: false },
    answer: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active' }
}, { timestamps: true });

const ContactSetting = sequelize.define('ContactSetting', {
    address: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    mapUrl: DataTypes.TEXT,
    facebook: DataTypes.STRING,
    twitter: DataTypes.STRING,
    linkedin: DataTypes.STRING,
    instagram: DataTypes.STRING
}, { timestamps: true });

const SEOSetting = sequelize.define('SEOSetting', {
    metaTitle: DataTypes.STRING,
    metaDescription: DataTypes.TEXT,
    metaKeywords: DataTypes.TEXT,
    googleAnalyticsId: DataTypes.STRING
}, { timestamps: true });

module.exports = {
    WebsiteSetting,
    HeaderSetting,
    AboutSetting,
    Testimonial,
    Feature,
    Pricing,
    FAQ,
    ContactSetting,
    SEOSetting
};
