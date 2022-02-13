const express = require('express');
const {
    getMyRCoinRecords,
    convert,
    getCashoutHistory,
    makeCashout
} = require('../controllers/rcoins');

const router = express.Router();

router.get('/records/:myId', getMyRCoinRecords);
router.post('/convert/:myId', convert);
router.get('/cashout/history/:myId', getCashoutHistory);
router.post('/cashout/:myId', makeCashout);

module.exports = router;