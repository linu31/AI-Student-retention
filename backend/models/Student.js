const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  age: Number,
  gender: String,
  department: String,
  semester: Number,
  
  // Academic Performance
  academicRecords: [{
    subject: String,
    score: Number,
    grade: String,
    semester: Number
  }],
  cgpa: Number,
  previousSemesterCGPA: Number,
  
  // Attendance Records
  attendance: [{
    subject: String,
    percentage: Number,
    totalClasses: Number,
    attendedClasses: Number
  }],
  overallAttendance: Number,
  
  // LMS Activity
  lmsActivity: {
    lastLogin: Date,
    averageLoginPerWeek: Number,
    assignmentsSubmitted: Number,
    totalAssignments: Number,
    forumPosts: Number,
    contentViews: Number,
    quizAttempts: Number,
    quizScores: [Number]
  },
  
  // Financial Patterns
  financialStatus: {
    tuitionPaid: Boolean,
    scholarshipAmount: Number,
    scholarshipType: String,
    paymentDelays: Number,
    financialAidApplied: Boolean,
    partTimeJob: Boolean
  },
  
  // Risk Assessment
  riskPrediction: {
    riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
    riskScore: Number,
    factors: [String],
    lastUpdated: Date
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);