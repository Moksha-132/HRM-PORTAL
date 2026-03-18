const express = require('express');
const { handleChat, getUserHistory } = require('../controllers/chatController');

const router = express.Router();

router.post('/', handleChat);
router.get('/history/:userId', getUserHistory);

module.exports = router;
