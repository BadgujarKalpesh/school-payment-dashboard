const mongoose = require('mongoose');

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
  error_message: { type: String }
}, { timestamps: true });

const WebhookLog = mongoose.model('WebhookLog', WebhookLogSchema);
module.exports = WebhookLog;
