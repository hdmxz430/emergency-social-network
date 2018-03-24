const express = require('express');
const router = express.Router();
const controller = require('../controllers/dangerous_zone_controller');
//const {authenticate} = require('../controllers/utils');
/* GET wall page. */
router.get('/', controller.gotoDangerousZone);
router.get('/report_dangerous_zone', controller.reportDangerousZone);
router.post('/save_dangerous_zone', controller.saveDangerousZone);
router.get('/show_dangerous_zone', controller.getDangerousZoneAround);
router.get('/goto_show_dangerous_zone', controller.gotoShowDangerousZone);

module.exports = router;