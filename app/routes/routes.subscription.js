const express = require('express');
const router = express.Router();
const Subscription = require('../../app/controllers/subscription.controller');

router
    // .post('/subscribe', Subscription.subscribe)
    .post('/subscribe/author', Subscription.subscribeToAuthor)
    .post('/subscribe/category', Subscription.subscribeToCategory)
    .get('/subscriptions', Subscription.subscriptions)

module.exports = router;
