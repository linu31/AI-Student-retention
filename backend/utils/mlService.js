const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

const mlService = {
  async predictRisk(studentData) {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/predict-risk`, studentData);
      return response.data;
    } catch (error) {
      console.error('Risk prediction failed:', error);
      throw error;
    }
  },

  async getCareerRecommendation(studentData) {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/recommend-career`, studentData);
      return response.data;
    } catch (error) {
      console.error('Career recommendation failed:', error);
      throw error;
    }
  },

  async getPersonalizedAdvice(studentData) {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/personalized-advice`, studentData);
      return response.data;
    } catch (error) {
      console.error('Personalized advice failed:', error);
      throw error;
    }
  },

  async getAdaptiveLearningPath(studentData) {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/adaptive-learning`, studentData);
      return response.data;
    } catch (error) {
      console.error('Adaptive learning path failed:', error);
      throw error;
    }
  }
};

module.exports = mlService;