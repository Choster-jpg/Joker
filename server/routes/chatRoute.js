const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');

router.route('/')
    .get(authMiddleware(false), chatController.fetchChats)
    .post(authMiddleware(false), chatController.accessChat)
    .delete(authMiddleware(false), chatController.removeChat);

router.route('/group')
    .post(authMiddleware(false), chatController.createGroupChat)
    .put(authMiddleware(false), chatController.renameGroupChat)
    .get(authMiddleware(false), chatController.fetchGroupChats);

router.put('/group/add', authMiddleware(false), chatController.addGroupChatMember); //member
router.put('/group/remove', authMiddleware(false), chatController.removeGroupChatMember); //member

module.exports = router;