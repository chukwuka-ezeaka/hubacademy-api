const express = require('express');
const PostCtrl = require('../controllers/post.controller');
const router = express.Router();

router
    .get('/list', PostCtrl.all)
    .post('/create', PostCtrl.create)
    .post('/like', PostCtrl.like)
    .get('/:id', PostCtrl.get)
    .delete('/:id', PostCtrl.delete)
    .put('/:id', PostCtrl.update)

module.exports = router;