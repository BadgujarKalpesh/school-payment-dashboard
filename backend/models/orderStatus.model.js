const mongoose = require('mongoose');

const OrderStatusSchema = new mongoose.Schema({
  collect_id: { type: String, required: true, unique: true }, // Reference to collect_request_id
  order_amount: { type: Number },
  transaction_amount: { type: Number },
  payment_mode: { type: String },
  payment_details: { type: String },
  bank_reference: { type: String },
  payment_message: { type: String },
  status: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED'],
    default: 'PENDING',
  },
  error_message: { type: String },
  payment_time: { type: Date },
}, { timestamps: true });

const OrderStatus = mongoose.model('OrderStatus', OrderStatusSchema);
module.exports = OrderStatus;
