const express = require('express');
const { 
    getHeaderSettings, updateHeaderSettings,
    getWebsiteSettings, updateWebsiteSettings,
    getAboutSettings, updateAboutSettings,
    getContactSettings, updateContactSettings,
    getFeatures, createFeature, updateFeature, deleteFeature,
    getPricings, createPricing, updatePricing, deletePricing
} = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/website', getWebsiteSettings);
router.put('/website', protect, upload.single('logoUrl'), updateWebsiteSettings);

router.get('/header', getHeaderSettings);
router.put('/header', protect, upload.single('backgroundImage'), updateHeaderSettings);

router.get('/about', getAboutSettings);
router.put('/about', protect, updateAboutSettings);

router.get('/contact', getContactSettings);
router.put('/contact', protect, updateContactSettings);

router.route('/features')
    .get(getFeatures)
    .post(protect, createFeature);

router.route('/features/:id')
    .put(protect, updateFeature)
    .delete(protect, deleteFeature);

router.route('/pricing')
    .get(getPricings)
    .post(protect, createPricing);

router.route('/pricing/:id')
    .put(protect, updatePricing)
    .delete(protect, deletePricing);

module.exports = router;
