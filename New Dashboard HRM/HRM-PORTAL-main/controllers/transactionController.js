const Transaction = require('../models/Transaction');
const Company = require('../models/Company');

// @desc    Get all transactions
// @route   GET /api/v1/transactions
// @access  Private/Admin
exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            include: [{ model: Company, attributes: ['name', 'id'] }],
            order: [['transactionDate', 'DESC']]
        });
        res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Create new transaction
// @route   POST /api/v1/transactions
// @access  Private/Admin
exports.createTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.create(req.body);
        
        const rTransaction = await Transaction.findByPk(transaction.id, {
            include: [{ model: Company, attributes: ['name', 'id'] }]
        });
        
        res.status(201).json({ success: true, data: rTransaction });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update transaction
// @route   PUT /api/v1/transactions/:id
// @access  Private/Admin
exports.updateTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findByPk(req.params.id);
        if (!transaction) {
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }
        await transaction.update(req.body);

        const rTransaction = await Transaction.findByPk(transaction.id, {
            include: [{ model: Company, attributes: ['name', 'id'] }]
        });
        
        res.status(200).json({ success: true, data: rTransaction });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete transaction
// @route   DELETE /api/v1/transactions/:id
// @access  Private/Admin
exports.deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findByPk(req.params.id);
        if (!transaction) {
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }
        await transaction.destroy();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
