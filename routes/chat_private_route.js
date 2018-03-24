const express = require('express');
const router = express.Router();
const controller = require('../controllers/chat_private_controller');
const {authUser} = require('../controllers/utils');

router.get("/", authUser, controller.gotoChatPrivate);
router.get('/messages', authUser, controller.getHistoryMessage);
router.post('/messages', authUser, controller.postMessage);

module.exports = router;