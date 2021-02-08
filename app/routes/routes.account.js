const express = require('express');
const AccountCtrl = require('../../app/controllers/account.controller');
const RoleCtrl = require('../../app/controllers/role.controller');
const PermissionCtrl = require('../../app/controllers/permission.controller');
const UsersCtrl = require('../../app/controllers/users.controller');
const HomeCtrl = require('../../app/controllers/general.controller');
const account = express.Router();
const passport = require('passport');
require('../../config/config.passport');

account
    .get('/role/list', RoleCtrl.all)
    .post('/role/create', RoleCtrl.create)
    .get('/role/:id', RoleCtrl.get)
    .delete('/role/:id', RoleCtrl.delete)
    .put('/role/:id', RoleCtrl.update)

    .get('/permission/list', PermissionCtrl.all)
    .post('/permission/create', PermissionCtrl.create)
    .delete('/permission/:id', PermissionCtrl.delete)
    .put('/permission/:id', PermissionCtrl.update)

    .post('/user/role/assign', UsersCtrl.assignRole)
    .get('/user/list', UsersCtrl.All)
    .get('/user/list/authors', UsersCtrl.Authors)
    .get('/user/list/role/:id', UsersCtrl.usersByRole)
    .get('/user/list/authors/category/:id', UsersCtrl.AuthorsByCategory)
    .get('/user/get/:id', UsersCtrl.get)
    .delete('/user/:id', UsersCtrl.delete)
    .put('/user/:id', UsersCtrl.update)
    .get('/user/:id/suspend', UsersCtrl.suspend)
    .get('/user/list/with_roles', UsersCtrl.AllWithRoles)

module.exports = account;
