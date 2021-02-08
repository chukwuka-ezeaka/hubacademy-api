const express = require('express');
const router = express.Router();
const Transaction = require('../../app/controllers/transaction.controller');

router
    .post('/start', Transaction.start)
    .post('/close', Transaction.close)
    .post('/history', Transaction.history)

module.exports = router;
