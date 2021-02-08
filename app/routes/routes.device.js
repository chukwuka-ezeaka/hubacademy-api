const express = require('express');
const UserDeviceCtrl = require('../controllers/device.controller');
const router = express.Router();

router
    // .get('/list', MediaLnkCtrl.all)
    .post('/link', UserDeviceCtrl.link)
    // .get('/:id', MediaLnkCtrl.get)
    // .delete('/:id', MediaLnkCtrl.delete)
    // .put('/:id', MediaLnkCtrl.update)

module.exports = router;
