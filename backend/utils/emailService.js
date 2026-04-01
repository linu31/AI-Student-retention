const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEarlyWarningEmail = async (student, riskData) => {
  const warningTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .warning { background: #fff3cd; border: 1px solid #ffeeba; padding: 15px; margin: 15px 0; }
        .factors { background: white; padding: 15px; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .button { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        .highlight { color: #dc3545; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Academic Early Warning System</h1>
        </div>
        
        <div class="content">
          <h2>Dear ${student.name},</h2>
          
          <p>Our AI-powered early warning system has detected that you may be at <span class="highlight">${riskData.riskLevel} risk</span> of academic difficulty.</p>
          
          <div class="warning">
            <h3>⚠️ Immediate Attention Required</h3>
            <p>Your current academic indicators show:</p>
            <ul>
              <li>Attendance: ${student.overallAttendance}% (Below recommended 75%)</li>
              <li>Current CGPA: ${student.cgpa}</li>
              <li>LMS Activity: ${student.lmsActivity?.averageLoginPerWeek || 0} logins/week</li>
            </ul>
          </div>
          
          <div class="factors">
            <h3>📊 Risk Factors Identified:</h3>
            <ul>
              ${riskData.factors.map(factor => `<li>${factor}</li>`).join('')}
            </ul>
          </div>
          
          <h3>🎯 Recommended Actions:</h3>
          <ol>
            <li>Schedule a meeting with your academic advisor immediately</li>
            <li>Attend all upcoming classes - missing even one more class could increase your risk level</li>
            <li>Complete pending assignments and catch up on missed coursework</li>
            <li>Use the LMS resources and tutoring services available</li>
          </ol>
          
          <p><strong>Remember:</strong> This is an early warning to help you succeed. We believe in your potential and are here to support you.</p>
          
          <p>Best regards,<br>Student Success Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message from the Student Retention System. Please do not reply to this email.</p>
          <p>© 2024 Student Success Initiative</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: student.email,
    subject: `⚠️ Early Warning Alert - Academic Risk Assessment for ${student.name}`,
    html: warningTemplate
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEarlyWarningEmail };