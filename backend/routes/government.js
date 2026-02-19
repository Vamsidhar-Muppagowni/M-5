const express = require('express');
const router = express.Router();
const governmentController = require('../controllers/governmentController');

router.get('/schemes', governmentController.getSchemes);

module.exports = router;
