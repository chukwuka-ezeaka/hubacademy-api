const express = require('express');
const SettlementCtrl = require('../controllers/settlement.controller');
const router = express.Router();

router
    .post('/payout/request', SettlementCtrl.payoutRequest)
    .get('/payout/history', SettlementCtrl.getPayoutHistory)
    .get('/bank/list', SettlementCtrl.banksList)
    .get('/bank/account/:id', SettlementCtrl.getAccount)
    .get('/bank/account', SettlementCtrl.getAccount)
    .put('/bank/account', SettlementCtrl.bankCreate)

module.exports = router;
