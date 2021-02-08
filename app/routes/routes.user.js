const express = require('express');
const UserCtrl = require('../../app/controllers/user.controller');
const router = express.Router();

router
    .post('/invite', UserCtrl.invite)
    .put('/profile/photo/:id', UserCtrl.uploadProfilePic)
    .put('/profile/photo', UserCtrl.uploadProfilePic)
    .post('/profile/like', UserCtrl.like)
    .post('/profile/follow', UserCtrl.follow)
    .get('/profile/followers/:id?', UserCtrl.followers)
    .get('/profile/reviews/:id?', UserCtrl.reviews)
    

module.exports = router;
