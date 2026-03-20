const express = require('express');
const { handleChat, getUserHistory } = require('../controllers/chatController');

const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/', upload.single('file'), handleChat);
router.get('/history/:userId', getUserHistory);

module.exports = router;
