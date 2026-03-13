const mongoose = require('mongoose');

const WebsiteSettingSchema = new mongoose.Schema({
    siteName: { type: String },
    logoUrl: { type: String },
    faviconUrl: { type: String },
    footerText: { type: String }
});

const HeaderSettingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String },
    backgroundImage: { type: String }, // URL or path
    buttonText: { type: String },
    buttonLink: { type: String },
    showButton: { type: Boolean, default: true }
});

const AboutSettingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    mission: { type: String },
    vision: { type: String }
});

const TestimonialSchema = new mongoose.Schema({
    clientName: { type: String, required: true },
    feedback: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    clientImage: { type: String }
});

const FeatureSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String }
});

const PricingSchema = new mongoose.Schema({
    planName: { type: String, required: true },
    price: { type: Number, required: true },
    features: [String],
    isPopular: { type: Boolean, default: false }
});

const FAQSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
});

const ContactSettingSchema = new mongoose.Schema({
    address: { type: String },
    email: { type: String },
    phone: { type: String },
    mapUrl: { type: String },
    facebook: { type: String },
    twitter: { type: String },
    linkedin: { type: String },
    instagram: { type: String }
});

const SEOSettingSchema = new mongoose.Schema({
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
    googleAnalyticsId: { type: String }
});

module.exports = {
    WebsiteSetting: mongoose.model('WebsiteSetting', WebsiteSettingSchema),
    HeaderSetting: mongoose.model('HeaderSetting', HeaderSettingSchema),
    AboutSetting: mongoose.model('AboutSetting', AboutSettingSchema),
    Testimonial: mongoose.model('Testimonial', TestimonialSchema),
    Feature: mongoose.model('Feature', FeatureSchema),
    Pricing: mongoose.model('Pricing', PricingSchema),
    FAQ: mongoose.model('FAQ', FAQSchema),
    ContactSetting: mongoose.model('ContactSetting', ContactSettingSchema),
    SEOSetting: mongoose.model('SEOSetting', SEOSettingSchema),
};
