const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Get all notifications
router.get('/', notificationController.getAllNotifications);

// Get notification statistics
router.get('/stats', notificationController.getNotificationStats);

// Get notifications for specific student
router.get('/student/:studentId', notificationController.getStudentNotifications);

// Send manual warning
router.post('/send-warning', notificationController.sendManualWarning);

// Schedule risk check
router.post('/schedule-check', notificationController.scheduleRiskCheck);

// Resend failed notification
router.post('/resend/:notificationId', notificationController.resendNotification);

// Delete notification
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;