const express = require('express');
const MediaManagerCtrl = require('../../app/controllers/media.manager.controller');
const router = express.Router();

router
    .post('/:type/single/create', MediaManagerCtrl.uploadSingle)
    .put('/:type/single/update/:id', MediaManagerCtrl.updateMedia)
    .get('/:type/single/get/:id', MediaManagerCtrl.getMedia)
    // .post('/:type/multiple/create', MediaManagerCtrl.uploadImageMultiple)
    .get('/:type/single/find/:key', MediaManagerCtrl.getObjectSingle)
    .get('/:type/multiple/:admin?', MediaManagerCtrl.getAllMediaByOwner)

module.exports = router;