const express = require('express');
const router = express.Router();
const SubscriptionSettings = require('../../app/controllers/subscription_settings.controller');
const CounsellorSettings = require('../../app/controllers/counsellor.setting.controller');

router
    .put('/global/counselling', CounsellorSettings.update)
    .get('/global/counselling', CounsellorSettings.get)
    .put('/global/subscription', SubscriptionSettings.update)
    .get('/global/subscription', SubscriptionSettings.get)

module.exports = router;
