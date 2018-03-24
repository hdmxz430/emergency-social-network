const express = require('express');
const router = express.Router();
const controller = require('../controllers/nearby_controller');
const {authUser} = require('../controllers/utils');

/* GET home page. */
router.get('/', controller.nearbyUsersPage);
router.get('/chat', controller.nearbyChatPage);

// group chat operations
router.get('/users', authUser, controller.getNearbyUsers);
router.get('/groups', authUser, controller.getNearbyGroups);
router.post('/groups', authUser, controller.formGroupChats);
router.delete('/groups', authUser, controller.dismissGroupChats);

// messages
router.get('/messages', authUser, controller.getGroupMessages);
router.post('/messages', authUser, controller.postGroupMessages);

module.exports = router;