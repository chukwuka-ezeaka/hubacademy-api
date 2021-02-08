const express = require('express');
const ContentTypeCtrl = require('../controllers/content.type.controller');
const router = express.Router();

router
    .get('/list', ContentTypeCtrl.all)
    .post('/create', ContentTypeCtrl.create)
    .get('/:id', ContentTypeCtrl.get)
    .delete('/:id', ContentTypeCtrl.delete)
    .put('/:id', ContentTypeCtrl.update)

module.exports = router;