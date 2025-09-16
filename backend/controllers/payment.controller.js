const Order = require('../models/order.model');
const OrderStatus = require('../models/orderStatus.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios')


const paymentController = {
    createPayment : async (req, res) => {
    const { amount, student_info } = req.body;
    try {
        const custom_order_id = `ORD-${Date.now()}`;
        
        // const callback_url = process.env.FRONTEND_URL || 'http://localhost:5173/dashboard';
        const callback_url = process.env.FRONTEND_URL + '/dashboard';

        const signPayload = {
            school_id: process.env.DEFAULT_SCHOOL_ID,
            amount: String(amount),
            callback_url,
        };
        
        const sign = jwt.sign(signPayload, process.env.PG_SECRET_KEY);

        const edvironPayload = { ...signPayload, sign };

        const edvironResponse = await axios.post(
            'https://dev-vanilla.edviron.com/erp/create-collect-request',
            edvironPayload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.PAYMENT_API_KEY}`
                }
            }
        );

        console.log("edvironResponse : ", edvironResponse.data);

        const { collect_request_id, collect_request_url, gateway_name } = edvironResponse.data;
        
        const newOrder = new Order({
            school_id: process.env.DEFAULT_SCHOOL_ID,
            custom_order_id,
            collect_request_id: collect_request_id,
            gateway_name: gateway_name || 'Edviron', // Use gateway name from response or a default
            student_info,
            amount: amount
        });

        // console.log("newOrder : ", newOrder);
        await newOrder.save();

        const newOrderStatus = new OrderStatus({
            collect_id: collect_request_id,
            order_amount: amount,
            status: 'PENDING'
        });
        await newOrderStatus.save();

        // console.log(" Collect_request_url : ", collect_request_url)

        res.json({ paymentUrl: collect_request_url });

    } catch (error) {
        console.error("Error creating payment:", error.response ? error.response.data : error.message);
        res.status(500).json({ 
            message: "Server error while creating payment",
            error: error.response ? error.response.data : error.message
        });
    }
    },

    handleWebhook: async (req, res) => {
        console.log("==============================================");
        console.log("✅ WEBHOOK RECEIVED!");
        console.log("Timestamp:", new Date().toISOString());
        
        const payload = req.body;
        console.log("Full Payload:", JSON.stringify(payload, null, 2));

        const log = new WebhookLog({ payload });
        await log.save();
        
        try {
            const { order_info } = payload;
            if (!order_info || !order_info.order_id) {
                log.processing_status = 'ERROR';
                log.error_message = 'Invalid payload structure';
                await log.save();
                return res.status(400).send('Invalid payload');
            }
            console.log("order_info : ", order_info)
            const collect_id = order_info.order_id;

            const updatedStatus = await OrderStatus.findOneAndUpdate(
                { collect_id: collect_id },
                {
                    $set: {
                        status: order_info.status === 'success' ? 'SUCCESS' : 'FAILED',
                        transaction_amount: order_info.transaction_amount,
                        payment_mode: order_info.payment_mode,
                        payment_details: order_info.payemnt_details, // Typo in original spec, matching it
                        bank_reference: order_info.bank_reference,
                        payment_message: order_info.Payment_message, // Typo in original spec, matching it
                        payment_time: new Date(order_info.payment_time),
                        error_message: order_info.error_message,
                    }
                },
                { new: true }
            );

            if (!updatedStatus) {
                log.processing_status = 'ERROR';
                log.error_message = `OrderStatus not found for collect_id: ${collect_id}`;
                await log.save();
                return res.status(404).send('Order status not found');
            }

            console.log("✅ SUCCESS: OrderStatus updated successfully in the database.");
            log.processing_status = 'PROCESSED';
            await log.save();
            res.status(200).send('Webhook processed successfully');
            
        } catch (error) {
            console.error("❌ FATAL WEBHOOK ERROR:", error.message);
            log.processing_status = 'ERROR';
            log.error_message = error.message;
            await log.save();
            res.status(500).send('Internal Server Error');
        }
    }
};

module.exports = paymentController;