// routes/marketplaceRoutes.js
const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');

// Route to get all marketplace items
router.get('/items', marketplaceController.listMarketplaceItems);

// Route to process a purchase
router.post('/buy', marketplaceController.purchaseItem);

module.exports = router;
