const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const controller = require('../controllers/employeeController');

// All employee routes are protected
router.use(protect);

router.get('/dashboard', controller.getDashboardStats);

router.post('/attendance/clock-in', controller.clockIn);
router.post('/attendance/clock-out', controller.clockOut);
router.get('/attendance', controller.getAttendanceHistory);

router.route('/leaves')
    .get(controller.getMyLeaves)
    .post(controller.applyLeave);

router.get('/assets', controller.getMyAssets);
router.get('/appreciations', controller.getMyAppreciations);
router.get('/holidays', controller.getUpcomingHolidays);
router.get('/policies', controller.getPolicies);

router.route('/offboarding')
    .get(controller.getMyOffboardings)
    .post(controller.submitResignation);

router.route('/expenses')
    .get(controller.getMyExpenses)
    .post(controller.submitExpense);

router.get('/payroll', controller.getMyPayroll);
router.get('/payslips', controller.getMyPayslips);

router.route('/profile')
    .get(controller.getProfile)
    .put(controller.updateProfile);

router.put('/profile/password', controller.updatePassword);

module.exports = router;
