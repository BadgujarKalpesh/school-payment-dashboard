const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  school_id: { type: String, required: true, index: true },
  trustee_id: { type: String, required: false },
  custom_order_id: { type: String, required: true, unique: true, index: true },
  collect_request_id: { type: String, required: true, unique: true },
  gateway_name: { type: String },
  student_info: {
    name: String,
    email: String,
    id: String
  },
  amount: { type: Number, required: true },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
