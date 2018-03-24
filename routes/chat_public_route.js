const express = require('express');
const router = express.Router();
const controller = require('../controllers/chat_public_controller');
const imageController = require('../controllers/image_U_C_controller');
const {authUser} = require('../controllers/utils');
/* GET wall page. */
router.get('/', authUser, controller.gotoChatPublic);
router.post('/messages', authUser, controller.postMessage);
router.get('/messages', authUser, controller.getMessageList);
// /* Post Image */
// router.post('/imageMessages', imageController.postImageMessage);
// router.get('/images/:filename', imageController.getImage);
// router.get('/form', imageController.showUploadDialog);
// router.get('/', authUser, controller.gotoChatPublic);
// router.post('/messages', authUser, controller.postMessage);
// router.get('/messages', authUser, controller.getMessageList);

module.exports = router;