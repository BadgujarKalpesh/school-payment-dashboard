// backend/controllers/transaction.controller.js

const OrderStatus = require('../models/orderStatus.model');
const Order = require('../models/order.model');

const transactionController = {
    getAllTransactions: async (req, res) => {
        try {
            // Pagination
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.max(1, parseInt(req.query.limit) || 10);
            const skip = (page - 1) * limit;

            // Sorting
            const rawSortField = req.query.sort || 'createdAt';
            const orderParam = (req.query.order || 'desc').toLowerCase();
            const sortOrder = orderParam === 'asc' ? 1 : -1;

            // Safelist for sortable fields to prevent injection
            const allowedSortFields = new Set([
                'createdAt',
                'payment_time',
                'transaction_amount',
                'order_amount',
                'collect_id',
                'custom_order_id',
                'status',
                'school_id'
            ]);
            const sortField = allowedSortFields.has(rawSortField) ? rawSortField : 'createdAt';

            // Filters & Search
            const statusParam = req.query.status;
            const schoolId = req.query.schoolId;
            const search = req.query.search;

            // Build the match object for the aggregation pipeline
            const match = {};

            if (statusParam) {
                const statuses = statusParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
                if (statuses.length > 0) {
                    match.status = { $in: statuses };
                }
            }

            if (schoolId) {
                match['orderDetails.school_id'] = schoolId;
            }

            if (search) {
                const regex = { $regex: search, $options: 'i' };
                match.$or = [
                    { 'orderDetails.custom_order_id': regex },
                    { 'orderDetails.student_info.name': regex },
                    { 'orderDetails.student_info.email': regex },
                    { 'orderDetails.school_id': regex },
                    { collect_id: regex }
                ];
            }

            // Build the aggregation pipeline
            const pipeline = [
                {
                    $lookup: {
                        from: 'orders',
                        localField: 'collect_id',
                        foreignField: 'collect_request_id',
                        as: 'orderDetails'
                    }
                },
                { $unwind: '$orderDetails' },
                { $match: match },
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
                        student_info: '$orderDetails.student_info',
                        createdAt: '$orderDetails.createdAt'
                    }
                },
                { $sort: { [sortField]: sortOrder } },
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
            const transactions = result[0]?.transactions || [];
            const totalCount = result[0]?.totalCount[0]?.count || 0;

            res.status(200).json({
                transactions,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                totalCount
            });
        } catch (error) {
            console.error('Get All Transactions Error:', error);
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
            
            const order = await Order.findOne({ custom_order_id });
            
            if (!order) {
                return res.status(404).json({ message: 'Transaction not found.' });
            }

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

module.exports = transactionController;