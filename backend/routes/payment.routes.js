const express = require('express');
const paymentController = require('../controllers/payment.controller');
const verifyToken = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/create-payment', verifyToken, paymentController.createPayment);
router.get('/webhook', (req, res) => res.send('This endpoint is for POST webhook calls only.'));
router.post('/webhook', express.json({ type: '*/*' }), paymentController.handleWebhook);

module.exports = router;
