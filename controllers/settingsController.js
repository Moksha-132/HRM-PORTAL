const { HeaderSetting, WebsiteSetting, AboutSetting, ContactSetting, Feature, Pricing } = require('../models/Settings');

// @desc    Get Header Settings
// @route   GET /api/v1/settings/header
exports.getHeaderSettings = async (req, res) => {
    try {
        const settings = await HeaderSetting.findOne();
        res.status(200).json({ success: true, data: settings || {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Update Header Settings
// @route   PUT /api/v1/settings/header
exports.updateHeaderSettings = async (req, res) => {
    try {
        let settings = await HeaderSetting.findOne();

        const updateData = { ...req.body };
        
        // If an image was uploaded, add it to updateData
        if (req.file) {
            updateData.backgroundImage = `/uploads/${req.file.filename}`;
        }

        if (settings) {
            settings = await HeaderSetting.findByIdAndUpdate(settings._id, updateData, { new: true, runValidators: true });
        } else {
            settings = await HeaderSetting.create(updateData);
        }

        res.status(200).json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// --- About Settings ---
exports.getAboutSettings = async (req, res) => {
    try {
        const settings = await AboutSetting.findOne();
        res.status(200).json({ success: true, data: settings || {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateAboutSettings = async (req, res) => {
    try {
        let settings = await AboutSetting.findOne();
        if (settings) {
            settings = await AboutSetting.findByIdAndUpdate(settings._id, req.body, { new: true, runValidators: true });
        } else {
            settings = await AboutSetting.create(req.body);
        }
        res.status(200).json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// --- Contact Settings ---
exports.getContactSettings = async (req, res) => {
    try {
        const settings = await ContactSetting.findOne();
        res.status(200).json({ success: true, data: settings || {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateContactSettings = async (req, res) => {
    try {
        let settings = await ContactSetting.findOne();
        if (settings) {
            settings = await ContactSetting.findByIdAndUpdate(settings._id, req.body, { new: true, runValidators: true });
        } else {
            settings = await ContactSetting.create(req.body);
        }
        res.status(200).json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// --- Features ---
exports.getFeatures = async (req, res) => {
    try {
        const features = await Feature.find();
        res.status(200).json({ success: true, data: features });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.createFeature = async (req, res) => {
    try {
        const feature = await Feature.create(req.body);
        res.status(201).json({ success: true, data: feature });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateFeature = async (req, res) => {
    try {
        const feature = await Feature.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!feature) return res.status(404).json({ success: false, error: 'Not found' });
        res.status(200).json({ success: true, data: feature });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteFeature = async (req, res) => {
    try {
        const feature = await Feature.findByIdAndDelete(req.params.id);
        if (!feature) return res.status(404).json({ success: false, error: 'Not found' });
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// --- Pricing ---
exports.getPricings = async (req, res) => {
    try {
        const pricings = await Pricing.find();
        res.status(200).json({ success: true, data: pricings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.createPricing = async (req, res) => {
    try {
        const pricing = await Pricing.create(req.body);
        res.status(201).json({ success: true, data: pricing });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updatePricing = async (req, res) => {
    try {
        const pricing = await Pricing.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!pricing) return res.status(404).json({ success: false, error: 'Not found' });
        res.status(200).json({ success: true, data: pricing });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deletePricing = async (req, res) => {
    try {
        const pricing = await Pricing.findByIdAndDelete(req.params.id);
        if (!pricing) return res.status(404).json({ success: false, error: 'Not found' });
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
