const express = require('express');
const router = express.Router();
const controller = require('../controllers/search_info_controller');

router.get('/search_by_username', controller.searchUserByUsername);
router.get('/search_by_status', controller.searchUserByStatus);
router.get('/search_by_announcement', controller.searchAnnoucementByAnnounce);
router.get('/search_by_public_message', controller.searchPubMessageByMessage);
router.get('/search_by_private_message', controller.searchPriMessageByMessage);

module.exports = router;