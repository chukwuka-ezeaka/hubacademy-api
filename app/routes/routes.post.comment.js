const express = require('express');
const CommentCtrl = require('../controllers/comment.controller');
const router = express.Router();

router
    .get('/list/:id', CommentCtrl.listByPost)
    .post('/create', CommentCtrl.create)
    .post('/like', CommentCtrl.like)
    // .get('/:id', CommentCtrl.get)
    .delete('/:id', CommentCtrl.delete)
    .put('/:id', CommentCtrl.update)

module.exports = router;