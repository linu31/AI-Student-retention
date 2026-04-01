const Notification = require('../models/Notification');
const Student = require('../models/Student');
const { sendEarlyWarningEmail } = require('../utils/emailService');

const notificationController = {
  // Get all notifications
  async getAllNotifications(req, res) {
    try {
      const notifications = await Notification.find()
        .populate('studentId', 'name email studentId')
        .sort({ sentDate: -1 });
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  },

  // Get notifications for a specific student
  async getStudentNotifications(req, res) {
    try {
      const { studentId } = req.params;
      const notifications = await Notification.find({ studentId })
        .sort({ sentDate: -1 });
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching student notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  },

  // Send manual warning to student
  async sendManualWarning(req, res) {
    try {
      const { studentId, customMessage } = req.body;
      
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // Prepare risk data for email
      const riskData = {
        riskLevel: student.riskPrediction?.riskLevel || 'medium',
        factors: student.riskPrediction?.factors || ['Manual warning triggered'],
        customMessage
      };

      // Send email
      const emailResult = await sendEarlyWarningEmail(student, riskData);

      // Create notification record
      const notification = new Notification({
        studentId: student._id,
        type: 'warning',
        subject: 'Manual Early Warning Alert',
        message: customMessage || 'Manual warning sent by advisor',
        sentDate: new Date(),
        status: emailResult.success ? 'sent' : 'failed',
        response: emailResult.message
      });

      await notification.save();

      res.json({
        success: emailResult.success,
        notification
      });
    } catch (error) {
      console.error('Error sending manual warning:', error);
      res.status(500).json({ error: 'Failed to send warning' });
    }
  },

  // Schedule automated check for at-risk students
  async scheduleRiskCheck(req, res) {
    try {
      // Find students with medium or high risk who haven't received warning recently
      const atRiskStudents = await Student.find({
        'riskPrediction.riskLevel': { $in: ['medium', 'high'] },
        'riskPrediction.lastUpdated': {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      });

      const notifications = [];

      for (const student of atRiskStudents) {
        // Check if warning already sent in last 3 days
        const existingNotification = await Notification.findOne({
          studentId: student._id,
          type: 'warning',
          sentDate: { $gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
        });

        if (!existingNotification) {
          const riskData = {
            riskLevel: student.riskPrediction.riskLevel,
            factors: student.riskPrediction.factors
          };

          const emailResult = await sendEarlyWarningEmail(student, riskData);

          const notification = new Notification({
            studentId: student._id,
            type: 'warning',
            subject: 'Automated Early Warning Alert',
            message: 'System detected continued risk factors',
            sentDate: new Date(),
            status: emailResult.success ? 'sent' : 'failed'
          });

          await notification.save();
          notifications.push(notification);
        }
      }

      res.json({
        success: true,
        checked: atRiskStudents.length,
        sent: notifications.length,
        notifications
      });
    } catch (error) {
      console.error('Error scheduling risk check:', error);
      res.status(500).json({ error: 'Failed to schedule risk check' });
    }
  },

  // Get notification statistics
  async getNotificationStats(req, res) {
    try {
      const stats = await Notification.aggregate([
        {
          $group: {
            _id: {
              type: '$type',
              status: '$status'
            },
            count: { $sum: 1 }
          }
        }
      ]);

      const recentActivity = await Notification.find()
        .sort({ sentDate: -1 })
        .limit(10)
        .populate('studentId', 'name email');

      res.json({
        statistics: stats,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  },

  // Resend failed notification
  async resendNotification(req, res) {
    try {
      const { notificationId } = req.params;
      
      const notification = await Notification.findById(notificationId)
        .populate('studentId');
      
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      const student = notification.studentId;
      const riskData = {
        riskLevel: 'medium',
        factors: ['Resent notification']
      };

      const emailResult = await sendEarlyWarningEmail(student, riskData);

      if (emailResult.success) {
        notification.status = 'sent';
        notification.sentDate = new Date();
        await notification.save();
      }

      res.json({
        success: emailResult.success,
        notification
      });
    } catch (error) {
      console.error('Error resending notification:', error);
      res.status(500).json({ error: 'Failed to resend notification' });
    }
  },

  // Delete notification
  async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;
      await Notification.findByIdAndDelete(notificationId);
      res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  }
};

module.exports = notificationController;