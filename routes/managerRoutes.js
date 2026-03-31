const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();
const controller = require('../controllers/managerController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// MULTER CONFIG
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/policies';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

router.use(protect);
router.use(authorize('Manager'));

router.get('/dashboard', controller.getDashboardStats);

router.route('/employees')
    .get(controller.getEmployees)
    .post(controller.createEmployee);
router.route('/employees/:id')
    .put(controller.updateEmployee)
    .delete(controller.deleteEmployee);

router.route('/attendance')
    .get(controller.getAttendance)
    .post(controller.createAttendance);
router.route('/attendance/:id')
    .put(controller.updateAttendance)
    .delete(controller.deleteAttendance);

router.route('/leaves')
    .get(controller.getLeaves);
router.route('/leaves/:id')
    .put(controller.updateLeave)
    .delete(controller.deleteLeave);

router.route('/assets')
    .get(controller.getAssets)
    .post(controller.createAsset);
router.route('/assets/:id')
    .put(controller.updateAsset)
    .delete(controller.deleteAsset);

router.route('/payroll')
    .get(controller.getPayrolls)
    .post(controller.createPayroll);
router.route('/payroll/:id')
    .put(controller.updatePayroll)
    .delete(controller.deletePayroll);
router.post('/payroll/:id/generate-payslip', controller.generatePayslip);

router.route('/appreciations')
    .get(controller.getAppreciations)
    .post(controller.createAppreciation);
router.route('/appreciations/:id')
    .put(controller.updateAppreciation)
    .delete(controller.deleteAppreciation);

router.route('/policies')
    .get(controller.getPolicies)
    .post(upload.single('file'), controller.createPolicy);
router.route('/policies/:id')
    .put(upload.single('file'), controller.updatePolicy)
    .delete(controller.deletePolicy);

router.route('/offboardings')
    .get(controller.getOffboardings)
    .post(controller.createOffboarding);
router.route('/offboardings/:id')
    .put(controller.updateOffboarding)
    .delete(controller.deleteOffboarding);

router.route('/expenses')
    .get(controller.getExpenses)
    .post(controller.createExpense);
router.route('/expenses/:id')
    .put(controller.updateExpense)
    .delete(controller.deleteExpense);

router.route('/prepayments')
    .get(controller.getPrePayments)
    .post(controller.createPrePayment);
router.route('/prepayments/:id')
    .put(controller.updatePrePayment)
    .delete(controller.deletePrePayment);
router.put('/prepayments/:id/status', controller.updatePrePaymentStatus);

router.route('/increment-promotions')
    .get(controller.getIncrementPromotions)
    .post(controller.createIncrementPromotion);
router.route('/increment-promotions/:id')
    .put(controller.updateIncrementPromotion)
    .delete(controller.deleteIncrementPromotion);
router.put('/increment-promotions/:id/status', controller.updateIncrementPromotionStatus);

router.route('/holidays')
    .get(controller.getHolidays)
    .post(controller.createHoliday);
router.route('/holidays/:id')
    .put(controller.updateHoliday)
    .delete(controller.deleteHoliday);

router.route('/letters')
    .get(controller.getManagerLetters)
    .post(controller.sendLetter);
router.route('/letters/:id')
    .put(controller.updateLetter)
    .delete(controller.deleteLetter);

module.exports = router;
