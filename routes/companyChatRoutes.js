const express = require('express');
const {
    getCompanyChatBootstrap,
    getConversationMessages,
    createGroup,
    createCompanyUser,
    updateGroup,
    updateCompanyUser,
    deleteCompanyUser,
    addGroupMembers,
    updateGroupMembers,
    removeGroupMember,
    deleteGroup,
    sendConversationMessage,
    clearConversationMessages,
    editConversationMessage,
    deleteConversationMessage
} = require('../controllers/companyChatController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.get('/bootstrap', getCompanyChatBootstrap);
router.get('/conversations/:type/:target/messages', getConversationMessages);
router.post('/users', createCompanyUser);
router.put('/users/:id', updateCompanyUser);
router.delete('/users/:id', deleteCompanyUser);
router.post('/groups', createGroup);
router.put('/groups/:id', updateGroup);
router.delete('/groups/:id', deleteGroup);
router.post('/groups/:id/members', addGroupMembers);
router.put('/groups/:id/members', updateGroupMembers);
router.delete('/groups/:id/members/:userId', removeGroupMember);
router.post('/messages', upload.single('file'), sendConversationMessage);
router.delete('/conversations/:type/:target/messages', clearConversationMessages);
router.put('/messages/:id', editConversationMessage);
router.delete('/messages/:id', deleteConversationMessage);

module.exports = router;
