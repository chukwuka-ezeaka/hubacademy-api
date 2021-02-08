const express = require('express');
const AccountCtrl = require('../../app/controllers/account.controller');
const UsersCtrl = require('../../app/controllers/users.controller');
const HomeCtrl = require('../../app/controllers/general.controller');
const noAuth = express.Router();
const passport = require('passport');
require('../../config/config.passport');

noAuth
    .get('/', HomeCtrl.home)
    .post('/auth/register', AccountCtrl.register)
    .post('/auth/password/forgot', AccountCtrl.forgotPassword)
    .post('/auth/password/reset', AccountCtrl.resetPassword)
    .post('/auth/login', AccountCtrl.login)
    .get('/account/user/list',passport.authenticate('jwt', {session: false}), UsersCtrl.All)
    .get('/account/user/list/with_roles',passport.authenticate('jwt', {session: false}), UsersCtrl.AllWithRoles)

module.exports = noAuth;
