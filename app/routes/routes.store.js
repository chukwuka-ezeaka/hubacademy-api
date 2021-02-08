const express = require('express');
const router = express.Router();
const Subscription = require('../../app/controllers/subscription.controller');
const Content = require('../../app/controllers/content.controller');

router.get('/purchases', Subscription.store)
router.post('/purchase/content', Subscription.subscribeToContent)
router.post('/purchase/content/direct', Subscription.purchaseContentDirect)
router.get('/list', Content.store)

module.exports = router;
