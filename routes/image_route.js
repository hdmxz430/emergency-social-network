const express = require('express');
const router = express.Router();

const imageController = require('../controllers/image_U_C_controller');
//const {authenticate} = require('../controllers/utils');

/* Post Image */
router.post('/upload', imageController.postImageMessage);
router.get('/:filename', imageController.getImage);
// router.get('/form', imageController.showUploadDialog);

module.exports = router;