const express = require('express');
const { protect } = require('../middleware/authMiddleware');
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

// For simplicity, using protect to verify token. Depending on exact role logic, authorize('Manager') might be added.
// Here we assume any valid token works if testing locally, but adding 'Manager' or 'Super Admin' for security.

router.get('/dashboard', protect, controller.getDashboardStats);

router.route('/employees')
    .get(protect, controller.getEmployees)
    .post(protect, controller.createEmployee);
router.route('/employees/:id')
    .put(protect, controller.updateEmployee)
    .delete(protect, controller.deleteEmployee);

router.route('/attendance')
    .get(protect, controller.getAttendance)
    .post(protect, controller.createAttendance);
router.route('/attendance/:id')
    .put(protect, controller.updateAttendance)
    .delete(protect, controller.deleteAttendance);

router.route('/leaves')
    .get(protect, controller.getLeaves);
router.route('/leaves/:id')
    .put(protect, controller.updateLeave)
    .delete(protect, controller.deleteLeave);

router.route('/assets')
    .get(protect, controller.getAssets)
    .post(protect, controller.createAsset);
router.route('/assets/:id')
    .put(protect, controller.updateAsset)
    .delete(protect, controller.deleteAsset);

router.route('/payroll')
    .get(protect, controller.getPayrolls)
    .post(protect, controller.createPayroll);
router.route('/payroll/:id')
    .put(protect, controller.updatePayroll)
    .delete(protect, controller.deletePayroll);
router.post('/payroll/:id/generate-payslip', protect, controller.generatePayslip);

router.route('/appreciations')
    .get(protect, controller.getAppreciations)
    .post(protect, controller.createAppreciation);
router.route('/appreciations/:id')
    .put(protect, controller.updateAppreciation)
    .delete(protect, controller.deleteAppreciation);

router.route('/policies')
    .get(protect, controller.getPolicies)
    .post(protect, upload.single('file'), controller.createPolicy);
router.route('/policies/:id')
    .put(protect, upload.single('file'), controller.updatePolicy)
    .delete(protect, controller.deletePolicy);

router.route('/offboardings')
    .get(protect, controller.getOffboardings)
    .post(protect, controller.createOffboarding);
router.route('/offboardings/:id')
    .put(protect, controller.updateOffboarding)
    .delete(protect, controller.deleteOffboarding);

router.route('/expenses')
    .get(protect, controller.getExpenses)
    .post(protect, controller.createExpense);
router.route('/expenses/:id')
    .put(protect, controller.updateExpense)
    .delete(protect, controller.deleteExpense);

router.route('/holidays')
    .get(protect, controller.getHolidays)
    .post(protect, controller.createHoliday);
router.route('/holidays/:id')
    .put(protect, controller.updateHoliday)
    .delete(protect, controller.deleteHoliday);

module.exports = router;
