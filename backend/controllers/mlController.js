const Student = require('../models/Student');
const mlService = require('../utils/mlService');
const { sendEarlyWarningEmail } = require('../utils/emailService');

const mlController = {
  async analyzeStudent(req, res) {
    try {
      const { studentId } = req.params;
      const student = await Student.findById(studentId);
      
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // Prepare data for ML analysis
      const studentData = {
        academicPerformance: student.academicRecords,
        cgpa: student.cgpa,
        attendance: student.attendance,
        overallAttendance: student.overallAttendance,
        lmsActivity: student.lmsActivity,
        financialStatus: student.financialStatus
      };

      // Get risk prediction
      const riskPrediction = await mlService.predictRisk(studentData);
      
      // Update student with risk prediction
      student.riskPrediction = {
        riskLevel: riskPrediction.riskLevel,
        riskScore: riskPrediction.riskScore,
        factors: riskPrediction.factors,
        lastUpdated: new Date()
      };
      
      await student.save();

      // Send early warning email if medium or high risk
      if (riskPrediction.riskLevel === 'medium' || riskPrediction.riskLevel === 'high') {
        await sendEarlyWarningEmail(student, riskPrediction);
      }

      res.json({
        success: true,
        riskPrediction,
        student
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      res.status(500).json({ error: 'Analysis failed' });
    }
  },

  async getCareerRecommendation(req, res) {
    try {
      const { studentId } = req.params;
      const student = await Student.findById(studentId);
      
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const studentData = {
        academicPerformance: student.academicRecords,
        cgpa: student.cgpa,
        subjects: student.academicRecords.map(record => ({
          subject: record.subject,
          score: record.score
        }))
      };

      const recommendation = await mlService.getCareerRecommendation(studentData);
      
      res.json(recommendation);
    } catch (error) {
      console.error('Career recommendation failed:', error);
      res.status(500).json({ error: 'Career recommendation failed' });
    }
  },

  async getPersonalizedAdvice(req, res) {
    try {
      const { studentId } = req.params;
      const student = await Student.findById(studentId);
      
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const studentData = {
        academicPerformance: student.academicRecords,
        cgpa: student.cgpa,
        attendance: student.attendance,
        lmsActivity: student.lmsActivity,
        riskLevel: student.riskPrediction?.riskLevel
      };

      const advice = await mlService.getPersonalizedAdvice(studentData);
      
      res.json(advice);
    } catch (error) {
      console.error('Personalized advice failed:', error);
      res.status(500).json({ error: 'Personalized advice failed' });
    }
  },

  async getAdaptiveLearningPath(req, res) {
    try {
      const { studentId } = req.params;
      const student = await Student.findById(studentId);
      
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const studentData = {
        academicPerformance: student.academicRecords,
        cgpa: student.cgpa,
        weakSubjects: student.academicRecords
          .filter(record => record.score < 60)
          .map(record => record.subject),
        strongSubjects: student.academicRecords
          .filter(record => record.score > 80)
          .map(record => record.subject)
      };

      const learningPath = await mlService.getAdaptiveLearningPath(studentData);
      
      res.json(learningPath);
    } catch (error) {
      console.error('Adaptive learning path failed:', error);
      res.status(500).json({ error: 'Adaptive learning path failed' });
    }
  },

  async analyzeAllStudents(req, res) {
    try {
      const students = await Student.find({});
      const results = [];

      for (const student of students) {
        const studentData = {
          academicPerformance: student.academicRecords,
          cgpa: student.cgpa,
          attendance: student.attendance,
          overallAttendance: student.overallAttendance,
          lmsActivity: student.lmsActivity,
          financialStatus: student.financialStatus
        };

        const riskPrediction = await mlService.predictRisk(studentData);
        
        student.riskPrediction = {
          riskLevel: riskPrediction.riskLevel,
          riskScore: riskPrediction.riskScore,
          factors: riskPrediction.factors,
          lastUpdated: new Date()
        };
        
        await student.save();

        // Send early warning emails
        if (riskPrediction.riskLevel === 'medium' || riskPrediction.riskLevel === 'high') {
          await sendEarlyWarningEmail(student, riskPrediction);
        }

        results.push({
          studentId: student.studentId,
          name: student.name,
          riskLevel: riskPrediction.riskLevel,
          riskScore: riskPrediction.riskScore
        });
      }

      res.json({
        success: true,
        analyzedCount: results.length,
        results
      });
    } catch (error) {
      console.error('Batch analysis failed:', error);
      res.status(500).json({ error: 'Batch analysis failed' });
    }
  }
};

module.exports = mlController;