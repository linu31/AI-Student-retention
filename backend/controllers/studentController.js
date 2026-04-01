const Student = require('../models/Student');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const studentController = {
  // Get all students with filtering
  async getAllStudents(req, res) {
    try {
      const { risk, department, semester } = req.query;
      let query = {};

      if (risk) {
        query['riskPrediction.riskLevel'] = risk;
      }
      if (department) {
        query.department = department;
      }
      if (semester) {
        query.semester = semester;
      }

      const students = await Student.find(query).sort({ createdAt: -1 });
      res.json(students);
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  },

  // Get single student by ID
  async getStudent(req, res) {
    try {
      const student = await Student.findById(req.params.id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.json(student);
    } catch (error) {
      console.error('Error fetching student:', error);
      res.status(500).json({ error: 'Failed to fetch student' });
    }
  },

  // Upload students from CSV
  async uploadStudents(req, res) {
    try {
      const results = [];
      const filePath = req.file.path;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          // Process each row and save to database
          const savedStudents = [];
          
          for (const row of results) {
            try {
              // Parse subjects scores
              const subjects = [];
              if (row.subjects_scores) {
                const subjectPairs = row.subjects_scores.split(',');
                for (const pair of subjectPairs) {
                  const [subject, score] = pair.split(':');
                  subjects.push({
                    subject: subject.trim(),
                    score: parseInt(score),
                    semester: parseInt(row.semester) || 1
                  });
                }
              }

              // Parse attendance if available
              const attendance = [];
              if (row.attendance_data) {
                const attPairs = row.attendance_data.split(',');
                for (const pair of attPairs) {
                  const [subject, percentage] = pair.split(':');
                  attendance.push({
                    subject: subject.trim(),
                    percentage: parseInt(percentage),
                    totalClasses: 30, // Default value
                    attendedClasses: Math.round(30 * parseInt(percentage) / 100)
                  });
                }
              }

              const studentData = {
                studentId: row.studentId,
                name: row.name,
                email: row.email,
                age: parseInt(row.age) || 20,
                gender: row.gender || 'Not Specified',
                department: row.department || 'General',
                semester: parseInt(row.semester) || 1,
                academicRecords: subjects,
                cgpa: parseFloat(row.cgpa) || 0,
                overallAttendance: parseInt(row.overallAttendance) || 0,
                attendance: attendance,
                lmsActivity: {
                  lastLogin: new Date(),
                  averageLoginPerWeek: parseInt(row.lms_logins) || 0,
                  assignmentsSubmitted: parseInt(row.assignments_submitted) || 0,
                  totalAssignments: parseInt(row.total_assignments) || 10,
                  forumPosts: parseInt(row.forum_posts) || 0,
                  contentViews: parseInt(row.content_views) || 0,
                  quizAttempts: parseInt(row.quiz_attempts) || 0,
                  quizScores: []
                },
                financialStatus: {
                  tuitionPaid: row.tuition_paid === 'true',
                  scholarshipAmount: parseFloat(row.scholarship_amount) || 0,
                  scholarshipType: row.scholarship_type || 'none',
                  paymentDelays: parseInt(row.payment_delays) || 0,
                  financialAidApplied: row.financial_aid === 'true',
                  partTimeJob: row.part_time_job === 'true'
                }
              };

              // Check if student already exists
              let student = await Student.findOne({ studentId: row.studentId });
              
              if (student) {
                // Update existing student
                await Student.updateOne({ studentId: row.studentId }, studentData);
                savedStudents.push({ ...studentData, _id: student._id });
              } else {
                // Create new student
                student = new Student(studentData);
                await student.save();
                savedStudents.push(student);
              }
            } catch (err) {
              console.error('Error saving student:', err);
            }
          }

          // Clean up uploaded file
          fs.unlinkSync(filePath);

          res.json({
            success: true,
            count: savedStudents.length,
            students: savedStudents
          });
        });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to process upload' });
    }
  },

  // Get risk statistics
  async getRiskStats(req, res) {
    try {
      const stats = await Student.aggregate([
        {
          $group: {
            _id: '$riskPrediction.riskLevel',
            count: { $sum: 1 }
          }
        }
      ]);

      const departmentStats = await Student.aggregate([
        {
          $group: {
            _id: {
              department: '$department',
              riskLevel: '$riskPrediction.riskLevel'
            },
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        riskDistribution: stats,
        departmentWise: departmentStats
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  },

  // Update student
  async updateStudent(req, res) {
    try {
      const student = await Student.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: new Date() },
        { new: true }
      );
      
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      
      res.json(student);
    } catch (error) {
      console.error('Error updating student:', error);
      res.status(500).json({ error: 'Failed to update student' });
    }
  },

  // Delete student
  async deleteStudent(req, res) {
    try {
      const student = await Student.findByIdAndDelete(req.params.id);
      
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      
      res.json({ message: 'Student deleted successfully' });
    } catch (error) {
      console.error('Error deleting student:', error);
      res.status(500).json({ error: 'Failed to delete student' });
    }
  },

  // Bulk delete students
  async bulkDeleteStudents(req, res) {
    try {
      const { studentIds } = req.body;
      await Student.deleteMany({ _id: { $in: studentIds } });
      res.json({ message: 'Students deleted successfully' });
    } catch (error) {
      console.error('Error bulk deleting students:', error);
      res.status(500).json({ error: 'Failed to delete students' });
    }
  }
};

module.exports = studentController;