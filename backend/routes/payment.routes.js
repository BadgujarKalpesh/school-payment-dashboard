const express = require('express');
const paymentController = require('../controllers/payment.controller');
const verifyToken = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/create-payment', verifyToken, paymentController.createPayment);
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
