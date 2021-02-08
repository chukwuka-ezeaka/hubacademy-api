const express = require('express');
const ContentCtrl = require('../controllers/content.controller');
const router = express.Router();

router
    .get('/list', ContentCtrl.all)
    .get('/free', ContentCtrl.free)
    .get('/count', ContentCtrl.allCount)
    // .get('/list/category/:id', ContentCtrl.allByCategory)
    .post('/create', ContentCtrl.create)
    .post('/like', ContentCtrl.like)
    .get('/:id', ContentCtrl.get)
    .delete('/:id', ContentCtrl.delete)
    .put('/:id', ContentCtrl.update)

module.exports = router;