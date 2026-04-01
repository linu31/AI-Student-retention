import axios from 'axios';
import API from './api';

class MLService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Clear cache for a student
  clearCache(studentId) {
    const keys = ['career', 'advice', 'learning', 'risk'];
    keys.forEach(key => {
      this.cache.delete(`${key}_${studentId}`);
    });
  }

  // Get cached data or fetch new
  async getCachedOrFetch(key, studentId, fetchFunction) {
    const cacheKey = `${key}_${studentId}`;
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }

    const data = await fetchFunction();
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    return data;
  }

  // Analyze student risk
  async analyzeStudentRisk(studentId, studentData = null) {
    try {
      if (studentData) {
        // Direct ML service call
        const response = await API.ml.predictRiskDirect(studentData);
        return response.data;
      } else {
        // Backend API call
        const response = await API.ml.analyzeStudent(studentId);
        return response.data;
      }
    } catch (error) {
      console.error('Risk analysis failed:', error);
      throw error;
    }
  }

  // Get career recommendations
  async getCareerRecommendations(studentId, studentData = null) {
    try {
      return await this.getCachedOrFetch('career', studentId, async () => {
        if (studentData) {
          const response = await API.ml.recommendCareerDirect(studentData);
          return response.data;
        } else {
          const response = await API.ml.getCareerRecommendation(studentId);
          return response.data;
        }
      });
    } catch (error) {
      console.error('Career recommendation failed:', error);
      throw error;
    }
  }

  // Get personalized academic advice
  async getPersonalizedAdvice(studentId, studentData = null) {
    try {
      return await this.getCachedOrFetch('advice', studentId, async () => {
        if (studentData) {
          const response = await API.ml.getAdviceDirect(studentData);
          return response.data;
        } else {
          const response = await API.ml.getPersonalizedAdvice(studentId);
          return response.data;
        }
      });
    } catch (error) {
      console.error('Personalized advice failed:', error);
      throw error;
    }
  }

  // Get adaptive learning path
  async getAdaptiveLearningPath(studentId, studentData = null) {
    try {
      return await this.getCachedOrFetch('learning', studentId, async () => {
        if (studentData) {
          const response = await API.ml.getLearningPathDirect(studentData);
          return response.data;
        } else {
          const response = await API.ml.getAdaptiveLearningPath(studentId);
          return response.data;
        }
      });
    } catch (error) {
      console.error('Learning path generation failed:', error);
      throw error;
    }
  }

  // Batch analyze multiple students
  async batchAnalyzeStudents(studentIds) {
    try {
      const results = await Promise.all(
        studentIds.map(id => this.analyzeStudentRisk(id))
      );
      return results;
    } catch (error) {
      console.error('Batch analysis failed:', error);
      throw error;
    }
  }

  // Generate study plan based on weak subjects
  generateStudyPlan(weakSubjects, strongSubjects, availableTime = 20) {
    const plan = {
      weeklySchedule: [],
      recommendations: [],
      priority: []
    };

    // Prioritize weak subjects
    const totalSubjects = weakSubjects.length + strongSubjects.length;
    const weakTimeAllocation = Math.floor(availableTime * 0.7); // 70% time for weak subjects
    const strongTimeAllocation = availableTime - weakTimeAllocation;

    // Create weekly schedule
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    weakSubjects.forEach((subject, index) => {
      const dayIndex = index % 5; // Monday-Friday
      plan.weeklySchedule.push({
        day: days[dayIndex],
        subject,
        duration: Math.floor(weakTimeAllocation / weakSubjects.length),
        focus: 'Core concepts and practice',
        resources: this.getSubjectResources(subject)
      });
    });

    strongSubjects.forEach((subject, index) => {
      const dayIndex = (index + 3) % 7;
      plan.weeklySchedule.push({
        day: days[dayIndex],
        subject,
        duration: Math.floor(strongTimeAllocation / strongSubjects.length),
        focus: 'Advanced topics and projects',
        resources: this.getSubjectResources(subject, true)
      });
    });

    // Add weekend review
    plan.weeklySchedule.push({
      day: 'Sunday',
      subject: 'Review',
      duration: 3,
      focus: 'Review weak subjects and practice tests',
      resources: [
        { name: 'Practice Tests', url: '#' },
        { name: 'Flashcard Review', url: '#' }
      ]
    });

    return plan;
  }

  // Get subject-specific resources
  getSubjectResources(subject, advanced = false) {
    const resources = {
      'Programming': [
        { name: 'LeetCode', url: 'https://leetcode.com', type: 'Practice' },
        { name: 'GeeksforGeeks', url: 'https://geeksforgeeks.org', type: 'Tutorial' },
        { name: 'Stack Overflow', url: 'https://stackoverflow.com', type: 'Community' }
      ],
      'Mathematics': [
        { name: 'Khan Academy', url: 'https://khanacademy.org', type: 'Course' },
        { name: 'Wolfram Alpha', url: 'https://wolframalpha.com', type: 'Tool' },
        { name: 'Paul\'s Math Notes', url: 'https://tutorial.math.lamar.edu', type: 'Notes' }
      ],
      'Database': [
        { name: 'SQLZoo', url: 'https://sqlzoo.net', type: 'Practice' },
        { name: 'Mode SQL Tutorial', url: 'https://mode.com/sql-tutorial', type: 'Tutorial' },
        { name: 'Database Design', url: 'https://dbdiagram.io', type: 'Tool' }
      ],
      'Networks': [
        { name: 'Cisco Networking Academy', url: 'https://netacad.com', type: 'Course' },
        { name: 'Professor Messer', url: 'https://professormesser.com', type: 'Videos' },
        { name: 'Packet Tracer', url: 'https://netacad.com/courses/packet-tracer', type: 'Tool' }
      ]
    };

    // Find matching resources
    for (const [key, value] of Object.entries(resources)) {
      if (subject.toLowerCase().includes(key.toLowerCase())) {
        return advanced ? value.slice(0, 2) : value;
      }
    }

    // Default resources
    return [
      { name: 'Coursera', url: 'https://coursera.org', type: 'Courses' },
      { name: 'YouTube Tutorials', url: 'https://youtube.com', type: 'Videos' },
      { name: 'Quizlet', url: 'https://quizlet.com', type: 'Flashcards' }
    ];
  }

  // Calculate risk trends
  calculateRiskTrends(historicalData) {
    const trends = {
      improving: [],
      stable: [],
      declining: []
    };

    historicalData.forEach(student => {
      if (student.riskHistory && student.riskHistory.length > 1) {
        const firstRisk = this.riskScoreToNumber(student.riskHistory[0].level);
        const lastRisk = this.riskScoreToNumber(student.riskHistory[student.riskHistory.length - 1].level);
        
        if (lastRisk < firstRisk) {
          trends.improving.push(student.name);
        } else if (lastRisk > firstRisk) {
          trends.declining.push(student.name);
        } else {
          trends.stable.push(student.name);
        }
      }
    });

    return trends;
  }

  // Convert risk level to numeric score
  riskScoreToNumber(level) {
    switch(level) {
      case 'low': return 1;
      case 'medium': return 2;
      case 'high': return 3;
      default: return 0;
    }
  }

  // Generate intervention recommendations
  generateInterventions(student) {
    const interventions = [];
    const riskLevel = student.riskPrediction?.riskLevel;

    if (riskLevel === 'high') {
      interventions.push({
        type: 'urgent',
        action: 'Schedule immediate one-on-one meeting',
        deadline: 'Within 24 hours',
        responsible: 'Academic Advisor'
      });
      
      interventions.push({
        type: 'academic',
        action: 'Enroll in academic support program',
        deadline: 'Within 3 days',
        responsible: 'Student Success Center'
      });
      
      interventions.push({
        type: 'monitoring',
        action: 'Daily check-in for next 2 weeks',
        deadline: 'Immediate',
        responsible: 'Faculty Mentor'
      });
    } else if (riskLevel === 'medium') {
      interventions.push({
        type: 'academic',
        action: 'Join study group for weak subjects',
        deadline: 'Within 1 week',
        responsible: 'Student'
      });
      
      interventions.push({
        type: 'monitoring',
        action: 'Weekly progress review',
        deadline: 'Ongoing',
        responsible: 'Academic Advisor'
      });
    }

    return interventions;
  }

  // Export analysis report
  exportReport(studentData, type = 'pdf') {
    const report = {
      generatedAt: new Date().toISOString(),
      studentInfo: {
        name: studentData.name,
        id: studentData.studentId,
        department: studentData.department,
        semester: studentData.semester
      },
      riskAnalysis: studentData.riskPrediction,
      careerRecommendations: studentData.careerRecommendations,
      learningPath: studentData.learningPath,
      interventions: this.generateInterventions(studentData)
    };

    if (type === 'json') {
      return JSON.stringify(report, null, 2);
    } else {
      // For PDF generation, you'd use a library like jsPDF
      console.log('Generate PDF report:', report);
      return report;
    }
  }
}

// Create and export singleton instance
const mlService = new MLService();
export default mlService;