const mongoose = require('mongoose');

const riskAssessmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  assessmentDate: { type: Date, default: Date.now },
  riskLevel: String,
  riskScore: Number,
  contributingFactors: [{
    factor: String,
    impact: Number,
    details: String
  }],
  recommendations: [String],
  earlyWarningSent: { type: Boolean, default: false },
  warningSentDate: Date
});

module.exports = mongoose.model('RiskAssessment', riskAssessmentSchema);