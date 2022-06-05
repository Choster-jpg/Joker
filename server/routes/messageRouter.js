const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const messageController = require('../controllers/messageController');

router.route('/')
    .post(authMiddleware(false), messageController.sendMessage); //send message

router.get('/:chatId', authMiddleware(false), messageController.getAllMessage); //all chat messages

module.exports = router;

