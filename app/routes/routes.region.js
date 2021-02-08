const express = require('express');
const router = express.Router();
const Regions = require('../../app/controllers/regions.controller');

router
    .get('/country/list', Regions.all)

module.exports = router;