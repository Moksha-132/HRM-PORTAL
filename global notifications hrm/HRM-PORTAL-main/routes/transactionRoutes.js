const express = require('express');
const { getTransactions, createTransaction, updateTransaction, deleteTransaction } = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('Super Admin', 'Admin')); // allow Super Admin and Admin

router.route('/')
    .get(getTransactions)
    .post(createTransaction);

router.route('/:id')
    .put(updateTransaction)
    .delete(deleteTransaction);

module.exports = router;
