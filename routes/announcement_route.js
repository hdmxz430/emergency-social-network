const express = require('express');
const router = express.Router();
const controller = require('../controllers/announcement_controller');
const {authCoordinator, authUser} = require('../controllers/utils');

router.get('/page', controller.AnnouncementPage);
router.get('/', authUser, controller.getLatestAnnouncement);
router.post('/', authCoordinator, controller.postAnnouncement);

module.exports = router;