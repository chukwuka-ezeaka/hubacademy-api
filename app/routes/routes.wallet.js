const express = require('express');
const WalletCtrl = require('../../app/controllers/wallet.controller');
const router = express.Router();

router
    .get('/balance/:id', WalletCtrl.balance)
    .get('/balance', WalletCtrl.balance)
    .get('/history/:id', WalletCtrl.history)
    .get('/history', WalletCtrl.history)
    .post('/credit', WalletCtrl.credit)

module.exports = router;
