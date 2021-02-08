const express = require('express');
const Controller = require('../controllers/review.controller');
const router = express.Router();

router
    // .get('/list/:id', Controller.listByPost)
    .post('/create', Controller.create)
    // .post('/like', Controller.like)
    .get('/:id', Controller.get)
    .delete('/:id', Controller.delete)
    .put('/:id', Controller.update)

module.exports = router;
