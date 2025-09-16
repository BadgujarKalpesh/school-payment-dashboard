const express = require('express');
const transactionController = require('../controllers/transaction.controller');
const verifyToken = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/transactions', verifyToken, transactionController.getAllTransactions);
router.get('/transactions/school/:schoolId', verifyToken, transactionController.getTransactionsBySchool);
router.get('/transaction-status/:custom_order_id', verifyToken, transactionController.getTransactionStatus);

module.exports = router;
