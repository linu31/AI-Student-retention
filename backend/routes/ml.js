const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');

// Analyze single student
router.post('/analyze/:studentId', mlController.analyzeStudent);

// Get career recommendation
router.get('/career/:studentId', mlController.getCareerRecommendation);

// Get personalized advice
router.get('/advice/:studentId', mlController.getPersonalizedAdvice);

// Get adaptive learning path
router.get('/learning-path/:studentId', mlController.getAdaptiveLearningPath);

// Analyze all students
router.post('/analyze-all', mlController.analyzeAllStudents);

module.exports = router;