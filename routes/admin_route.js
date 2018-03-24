const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin_controller');
const {authAdmin} = require('../controllers/utils');


router.get("/", authAdmin, controller.AdminPage);
router.get('/userPage', authAdmin, controller.SpecificUserPage);
router.get('/users', authAdmin, controller.getUsers);
router.get('/user', authAdmin, controller.getSpecificUser);
router.post('/user',authAdmin,controller.updateUser);


module.exports = router;