const express = require('express');
const MediaLnkCtrl = require('../controllers/medialink.controller');
const router = express.Router();

router
    .get('/list', MediaLnkCtrl.all)
    .post('/create', MediaLnkCtrl.create)
    .get('/:id', MediaLnkCtrl.get)
    .delete('/:id', MediaLnkCtrl.delete)
    .put('/:id', MediaLnkCtrl.update)

module.exports = router;