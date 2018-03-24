const express = require('express');
const router = express.Router();
const controller = require('../controllers/index_controller');
const profile_controller = require('../controllers/user_profile_controller');
const {authUser} = require('../controllers/utils');

/* GET home page. */
router.get('/', controller.homepage);
router.get('/users/directory', controller.directoryPage);
router.get('/users/profile', profile_controller.userProfilePage);

router.get('/users/auth', controller.loginOrRegister);
router.post('/users/auth', controller.register);
router.delete('/users/auth', authUser, controller.logout);

router.get('/users', authUser, controller.getDirectoryList);
router.put('/users/status', authUser, profile_controller.update_status);
router.put('/users/updateWarn',authUser, profile_controller.update_warn);

module.exports = router;