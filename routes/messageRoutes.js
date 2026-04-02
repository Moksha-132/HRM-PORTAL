const express = require('express');
const { deleteMessageForEveryone } = require('../controllers/chatController');

const router = express.Router();

router.put('/:id/delete', deleteMessageForEveryone);

module.exports = router;
