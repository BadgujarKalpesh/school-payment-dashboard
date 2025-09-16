const OrderStatus = require('../models/orderStatus.model');
const Order = require('../models/order.model');

const transactionController = {
  // ================================================================
  // Get All Transactions (with pagination, filters, search, sorting)
  // ================================================================
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

      // Allowlist for sort fields (projected field names)
      const allowedSortFields = new Set([
        'createdAt',           // ✅ from OrderStatus
        'payment_time',
        'transaction_amount',
        'order_amount',
        'collect_id',
        'custom_order_id'
      ]);
      const sortField = allowedSortFields.has(rawSortField) ? rawSortField : 'createdAt';

      // Filters & search
      const statusParam = req.query.status; // e.g., "SUCCESS" or "SUCCESS,FAILED"
      const schoolId = req.query.schoolId;
      const search = req.query.search; // keyword

      const match = {};

      // Filter by status
      if (statusParam) {
        const statuses = statusParam.split(',')
          .map(s => s.trim().toUpperCase())
          .filter(Boolean);
        if (statuses.length === 1) {
          match.status = statuses[0];
        } else if (statuses.length > 1) {
          match.status = { $in: statuses };
        }
      }

      // Filter by schoolId
      if (schoolId) {
        match['orderDetails.school_id'] = schoolId;
      }

      // Search
      if (search) {
        const regex = { $regex: search, $options: 'i' };
        match.$or = [
          { 'orderDetails.custom_order_id': regex },
          { 'orderDetails.student_info.name': regex },
          { 'orderDetails.student_info.email': regex },
          { 'orderDetails.student_info.id': regex },
          { 'orderDetails.school_id': regex },
          { collect_id: regex }
        ];
      }

      // Aggregation pipeline
      const pipeline = [
        {
          $lookup: {
            from: 'orders',
            localField: 'collect_id',
            foreignField: 'collect_request_id',
            as: 'orderDetails'
          }
        },
        { $unwind: '$orderDetails' }
      ];

      if (Object.keys(match).length > 0) {
        pipeline.push({ $match: match });
      }

      pipeline.push({
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
          createdAt: '$createdAt' // ✅ OrderStatus createdAt (newest first)
        }
      });

      pipeline.push({ $sort: { [sortField]: sortOrder } });

      pipeline.push({
        $facet: {
          transactions: [
            { $skip: skip },
            { $limit: limit }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      });

      const aggResult = await OrderStatus.aggregate(pipeline);
      const transactions = aggResult[0]?.transactions || [];
      const totalCount = aggResult[0]?.totalCount?.[0]?.count || 0;

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

  // ================================================================
  // Get Transactions By School
  // ================================================================
  getTransactionsBySchool: async (req, res) => {
    try {
      const { schoolId } = req.params;
      const transactions = await Order.find({ school_id: schoolId });
      res.status(200).json(transactions);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // ================================================================
  // Get Transaction Status By Custom Order ID
  // ================================================================
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
