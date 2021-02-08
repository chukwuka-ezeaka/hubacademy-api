const express = require('express');
const ReflectionCtrl = require('../../app/controllers/reflection.controller');
const router = express.Router();

router

    .get('/list/all', ReflectionCtrl.allAdmin)
    .get('/list', ReflectionCtrl.all)
    .post('/create', ReflectionCtrl.create)
    .get('/today', ReflectionCtrl.getToday)
    .get('/:id', ReflectionCtrl.get)
    .delete('/:id', ReflectionCtrl.delete)
    .put('/:id', ReflectionCtrl.update)

module.exports = router;