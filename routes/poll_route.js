const express = require('express');
const router = express.Router();
const controller = require('../controllers/poll_controller');
const {authUser} = require('../controllers/utils');

router.get('/', controller.gotoPoll);
router.get('/list', authUser, controller.getPollList);
router.get('/detail', controller.gotoPolldetail);
router.get('/polldetail', controller.getPollDetail);
router.post('/', authUser, controller.postPoll);
router.post('/vote', authUser, controller.vote);

module.exports = router;