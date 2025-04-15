const express = require('express');
const router = express.Router();
const sportController = require('../controllers/sportController');

router.get('/', sportController.listSports);
router.post('/update', sportController.updateSports);

module.exports = router;
