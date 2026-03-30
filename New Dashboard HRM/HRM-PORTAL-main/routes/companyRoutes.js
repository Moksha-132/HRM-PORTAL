const express = require('express');
const {
    getCompanies,
    getCompany,
    createCompany,
    updateCompany,
    deleteCompany
} = require('../controllers/companyController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes here are protected and restricted to Super Admin or Admin
router.use(protect);
router.use(authorize('Super Admin', 'Admin'));

router.route('/')
    .get(getCompanies)
    .post(createCompany);

router.route('/:id')
    .get(getCompany)
    .put(updateCompany)
    .delete(deleteCompany);

module.exports = router;
