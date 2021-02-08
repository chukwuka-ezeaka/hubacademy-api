const express = require('express');
const ContentCategoryCtrl = require('../controllers/content.category.controller');
const router = express.Router();

router
    .get('/list', ContentCategoryCtrl.all)
    .post('/create', ContentCategoryCtrl.create)
    .get('/:id', ContentCategoryCtrl.get)
    .delete('/:id', ContentCategoryCtrl.delete)
    .put('/:id', ContentCategoryCtrl.update)

module.exports = router;