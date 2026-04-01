const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  type: { type: String, enum: ['warning', 'advice', 'reminder'] },
  subject: String,
  message: String,
  sentDate: Date,
  status: { type: String, enum: ['sent', 'pending', 'failed'] },
  response: String
});

module.exports = mongoose.model('Notification', notificationSchema);