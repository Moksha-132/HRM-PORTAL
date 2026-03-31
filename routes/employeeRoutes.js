const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const controller = require('../controllers/employeeController');

// All employee routes are protected
router.use(protect);
router.use(authorize('Employee'));

router.get('/dashboard', controller.getDashboardStats);

router.post('/attendance/clock-in', controller.clockIn);
router.post('/attendance/clock-out', controller.clockOut);
router.get('/attendance', controller.getAttendanceHistory);

router.route('/leaves')
    .get(controller.getMyLeaves)
    .post(controller.applyLeave);

router.route('/appreciations')
    .get(controller.getMyAppreciations)
    .post(controller.sendAppreciation);
router.delete('/appreciations/:id', controller.deleteAppreciation);
router.post('/appreciations/:id/comments', controller.addAppreciationComment);
router.get('/all-employees', controller.getAllEmployees);
router.get('/holidays', controller.getUpcomingHolidays);
router.get('/policies', controller.getPolicies);

router.route('/offboarding')
    .get(controller.getMyOffboardings)
    .post(controller.submitResignation);

router.route('/expenses')
    .get(controller.getMyExpenses)
    .post(controller.submitExpense);

router.route('/expenses/:id')
    .put(controller.updateExpense)
    .delete(controller.deleteExpense);

router.get('/payroll', controller.getMyPayroll);
router.get('/payslips', controller.getMyPayslips);
router.get('/payslips/:id/download', controller.downloadPayslip);
router.route('/prepayments')
    .get(controller.getMyPrePayments)
    .post(controller.submitPrePayment);
router.get('/increment-promotions', controller.getMyIncrementPromotions);

router.route('/profile')
    .get(controller.getProfile)
    .put(controller.updateProfile);

router.put('/profile/password', controller.updatePassword);

router.route('/letters')
    .get(controller.getEmployeeLetters);
router.route('/letters/:id')
    .put(controller.updateLetter);

module.exports = router;
