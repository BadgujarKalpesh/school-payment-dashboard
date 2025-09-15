const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { ObjectId } = mongoose.Types;

// --- Load Environment Variables ---
dotenv.config();

// --- Initialize Express App ---
const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// =================================================================================================
// |                                  File: backend/config/db.config.js                                |
// =================================================================================================
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1); // Exit process with failure
    }
};

connectDB();


// =================================================================================================
// |                                 File: backend/models/user.model.js                                |
// =================================================================================================
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', UserSchema);


// =================================================================================================
// |                                 File: backend/models/order.model.js                               |
// =================================================================================================
const orderSchema = new mongoose.Schema({
    school_id: { type: String, required: true },
    custom_order_id: { type: String, required: true, unique: true },
    
    // FIX: Field names updated to match API response and required validation
    collect_request_id: { type: String, required: true, unique: true }, 
    // payment_url: { type: String, required: true },

    student_info: {
        name: String,
        email: String,
    },
    
    amount: { type: Number, required: true },

}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);


// =================================================================================================
// |                             File: backend/models/orderStatus.model.js                           |
// =================================================================================================
const OrderStatusSchema = new mongoose.Schema({
    collect_id: { // Reference to the Order schema's collect_request_id
        type: String,
        required: true,
        unique: true
    },
    order_amount: {
        type: Number,
    },
    transaction_amount: {
        type: Number,
    },
    payment_mode: {
        type: String,
    },
    payment_details: {
        type: String,
    },
    bank_reference: {
        type: String,
    },
    payment_message: {
        type: String,
    },
    status: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'FAILED'],
        default: 'PENDING',
    },
    error_message: {
        type: String,
    },
    payment_time: {
        type: Date,
    },
}, { timestamps: true });

const OrderStatus = mongoose.model('OrderStatus', OrderStatusSchema);


// =================================================================================================
// |                             File: backend/models/webhookLog.model.js                            |
// =================================================================================================
const WebhookLogSchema = new mongoose.Schema({
    receivedAt: {
        type: Date,
        default: Date.now,
    },
    payload: {
        type: Object,
    },
    processing_status: {
        type: String,
        enum: ['RECEIVED', 'PROCESSED', 'ERROR'],
        default: 'RECEIVED'
    },
    error_message: {
        type: String
    }
}, { timestamps: true });

const WebhookLog = mongoose.model('WebhookLog', WebhookLogSchema);


// =================================================================================================
// |                            File: backend/middleware/auth.middleware.js                          |
// =================================================================================================
const verifyToken = (req, res, next) => {
    console.log("req hii")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }
    console.log("tokens : ", token)
    console.log("jwt :", process.env.JWT_SECRET)
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        console.log("decode : ", decoded);
        if (err) {
            return res.status(401).send({ message: "Unauthorized!" });
        }
        req.userId = decoded.id;
        next();
    });
};


// =================================================================================================
// |                           File: backend/controllers/auth.controller.js                          |
// =================================================================================================
const authController = {
    register: async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'Please provide email and password' });
            }
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }
            const user = new User({ email, password });
            await user.save();
            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: '24h'
            });
            res.status(200).json({
                message: "Login successful",
                accessToken: token,
                user: { id: user._id, email: user.email }
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

// =================================================================================================
// |                         File: backend/controllers/payment.controller.js                         |
// =================================================================================================
const paymentController = {
    createPayment : async (req, res) => {
    const { amount, student_info } = req.body;
    try {
        const custom_order_id = `ORD-${Date.now()}`;
        
        // Use a placeholder or a real frontend URL for the callback
        const callback_url = process.env.FRONTEND_URL || 'http://localhost:5173/dashboard';

        const signPayload = {
            school_id: process.env.DEFAULT_SCHOOL_ID,
            amount: String(amount),
            callback_url,
        };
        
        // Sign the payload with the PG_KEY
        const sign = jwt.sign(signPayload, process.env.PG_SECRET_KEY);

        const edvironPayload = { ...signPayload, sign };

        const edvironResponse = await axios.post(
            'https://dev-vanilla.edviron.com/erp/create-collect-request',
            edvironPayload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    // ==================================================================
                    // |                           THE FIX                            |
                    // ==================================================================
                    // This ensures the full, correct API key from the .env file is sent
                    'Authorization': `Bearer ${process.env.PAYMENT_API_KEY}`
                }
            }
        );

        const { collect_request_id, Collect_request_url } = edvironResponse.data;
        
        // Save order details to our local database
        const newOrder = new Order({
            school_id: process.env.DEFAULT_SCHOOL_ID,
            custom_order_id,
            collect_request_id: collect_request_id,
            student_info,
            amount: amount
        });
        await newOrder.save();

        const newOrderStatus = new OrderStatus({
            collect_id: collect_request_id,
            order_amount: amount,
            status: 'PENDING'
        });
        await newOrderStatus.save();

        res.json({ paymentUrl: Collect_request_url });

    } catch (error) {
        // Log the detailed error from the external API for better debugging
        console.error("Error creating payment:", error.response ? error.response.data : error.message);
        res.status(500).json({ 
            message: "Server error while creating payment",
            error: error.response ? error.response.data : error.message
        });
    }
},

    handleWebhook: async (req, res) => {
        const payload = req.body;
        
        // 1. Log the webhook payload
        const log = new WebhookLog({ payload });
        await log.save();
        
        try {
            const { order_info } = payload;
            if (!order_info || !order_info.order_id) {
                log.processing_status = 'ERROR';
                log.error_message = 'Invalid payload structure: missing order_info or order_id';
                await log.save();
                return res.status(400).send('Invalid payload');
            }
            
            const collect_id = order_info.order_id;

            // 2. Find and update the order status
            const updatedStatus = await OrderStatus.findOneAndUpdate(
                { collect_id: collect_id },
                {
                    $set: {
                        status: order_info.status === 'success' ? 'SUCCESS' : 'FAILED',
                        transaction_amount: order_info.transaction_amount,
                        payment_mode: order_info.payment_mode,
                        payment_details: order_info.payemnt_details,
                        bank_reference: order_info.bank_reference,
                        payment_message: order_info.Payment_message,
                        payment_time: new Date(order_info.payment_time),
                        error_message: order_info.error_message,
                    }
                },
                { new: true }
            );

            if (!updatedStatus) {
                log.processing_status = 'ERROR';
                log.error_message = `Order status not found for collect_id: ${collect_id}`;
                await log.save();
                return res.status(404).send('Order status not found');
            }

            log.processing_status = 'PROCESSED';
            await log.save();

            res.status(200).send('Webhook processed successfully');
            
        } catch (error) {
            console.error("Webhook Error:", error.message);
            log.processing_status = 'ERROR';
            log.error_message = error.message;
            await log.save();
            res.status(500).send('Internal Server Error');
        }
    }
};

// =================================================================================================
// |                       File: backend/controllers/transaction.controller.js                       |
// =================================================================================================
const transactionController = {
    getAllTransactions: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const sortField = req.query.sort || 'createdAt';
            const sortOrder = req.query.order === 'desc' ? -1 : 1;

            const skip = (page - 1) * limit;

            // Aggregation pipeline to join Order and OrderStatus
            const pipeline = [
                // 1. Join OrderStatus with Order
                {
                    $lookup: {
                        from: 'orders',
                        localField: 'collect_id',
                        foreignField: 'collect_request_id',
                        as: 'orderDetails'
                    }
                },
                // 2. Deconstruct the orderDetails array
                {
                    $unwind: '$orderDetails'
                },
                // 3. Shape the output
                {
                    $project: {
                        _id: 0,
                        collect_id: '$collect_id',
                        school_id: '$orderDetails.school_id',
                        gateway: '$orderDetails.gateway_name',
                        order_amount: '$order_amount',
                        transaction_amount: '$transaction_amount',
                        status: '$status',
                        payment_time: '$payment_time',
                        custom_order_id: '$orderDetails.custom_order_id',
                        createdAt: '$orderDetails.createdAt' // For sorting
                    }
                },
                // 4. Sorting
                {
                    $sort: { [sortField]: sortOrder }
                },
                // 5. Pagination
                {
                    $facet: {
                        transactions: [
                            { $skip: skip },
                            { $limit: limit }
                        ],
                        totalCount: [
                            { $count: 'count' }
                        ]
                    }
                }
            ];

            const result = await OrderStatus.aggregate(pipeline);
            const transactions = result[0].transactions;
            const totalCount = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
            
            res.status(200).json({
                transactions,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                totalCount
            });

        } catch (error) {
            console.error("Get All Transactions Error:", error.message);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    getTransactionsBySchool: async (req, res) => {
        try {
            const { schoolId } = req.params;
            const transactions = await Order.find({ school_id: schoolId });
            res.status(200).json(transactions);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    
    getTransactionStatus: async (req, res) => {
        try {
            const { custom_order_id } = req.params;
            
            // Find the order by our custom ID to get the collect_request_id
            const order = await Order.findOne({ custom_order_id });
            
            if (!order) {
                return res.status(404).json({ message: 'Transaction not found.' });
            }

            // Find the status using the gateway's ID
            const transactionStatus = await OrderStatus.findOne({ collect_id: order.collect_request_id });

            if (!transactionStatus) {
                return res.status(404).json({ message: 'Transaction status not found.' });
            }

            res.status(200).json(transactionStatus);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

// =================================================================================================
// |                                   File: backend/routes/api.js                                   |
// =================================================================================================

// --- Auth Routes ---
const authRouter = express.Router();
authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
app.use('/api/auth', authRouter);

// --- Payment Routes ---
const paymentRouter = express.Router();
paymentRouter.post('/create-payment', verifyToken, paymentController.createPayment); // Protected route
paymentRouter.post('/webhook', paymentController.handleWebhook); // Webhook should be public
app.use('/api/payment', paymentRouter);

// --- Transaction Routes ---
const transactionRouter = express.Router();
transactionRouter.get('/transactions', verifyToken, transactionController.getAllTransactions);
transactionRouter.get('/transactions/school/:schoolId', verifyToken, transactionController.getTransactionsBySchool);
transactionRouter.get('/transaction-status/:custom_order_id', verifyToken, transactionController.getTransactionStatus);
app.use('/api', transactionRouter);


// --- Root Endpoint ---
app.get('/', (req, res) => {
    res.send('School Payment API is running...');
});

// --- Start Server ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
