const Company = require('../models/Company');

// @desc    Get all companies
// @route   GET /api/v1/companies
// @access  Private/Admin
exports.getCompanies = async (req, res) => {
    try {
        const companies = await Company.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: companies.length,
            data: companies
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get single company
// @route   GET /api/v1/companies/:id
// @access  Private/Admin
exports.getCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ success: false, error: 'Company not found' });
        }
        res.status(200).json({ success: true, data: company });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Create new company
// @route   POST /api/v1/companies
// @access  Private/Admin
exports.createCompany = async (req, res) => {
    try {
        const company = await Company.create(req.body);
        res.status(201).json({ success: true, data: company });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update company
// @route   PUT /api/v1/companies/:id
// @access  Private/Admin
exports.updateCompany = async (req, res) => {
    try {
        const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!company) {
            return res.status(404).json({ success: false, error: 'Company not found' });
        }
        res.status(200).json({ success: true, data: company });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete company
// @route   DELETE /api/v1/companies/:id
// @access  Private/Admin
exports.deleteCompany = async (req, res) => {
    try {
        const company = await Company.findByIdAndDelete(req.params.id);
        if (!company) {
            return res.status(404).json({ success: false, error: 'Company not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
