import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiUser, FiMail, FiCalendar, FiBook, FiTrendingUp,
  FiBriefcase, FiTarget, FiBookOpen, FiArrowLeft
} from 'react-icons/fi';

const StudentCard = ({ student, setStudent }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [careerData, setCareerData] = useState(null);
  const [adviceData, setAdviceData] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const navigate = useNavigate();

  const getCareerRecommendation = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/ml/career/${student._id}`);
      setCareerData(response.data);
      setActiveTab('career');
      toast.success('Career recommendations generated');
    } catch (error) {
      toast.error('Failed to get career recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getPersonalizedAdvice = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/ml/advice/${student._id}`);
      setAdviceData(response.data);
      setActiveTab('advice');
      toast.success('Personalized advice generated');
    } catch (error) {
      toast.error('Failed to get advice');
    } finally {
      setLoading(false);
    }
  };

  const getAdaptiveLearningPath = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/ml/learning-path/${student._id}`);
      setLearningPath(response.data);
      setActiveTab('learning');
      toast.success('Learning path generated');
    } catch (error) {
      toast.error('Failed to get learning path');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (risk) => {
    switch(risk) {
      case 'high':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">High Risk</span>;
      case 'medium':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Medium Risk</span>;
      case 'low':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Low Risk</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">Not Analyzed</span>;
    }
  };

  if (!student) {
    return <div className="text-center py-8">Loading student data...</div>;
  }

  return (
    <div className="w-full">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/students')}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg w-full">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-full p-4">
                <FiUser className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{student.name}</h2>
                <p className="text-blue-100">ID: {student.studentId}</p>
                <div className="flex items-center mt-2">
                  <FiMail className="mr-2" />
                  <span>{student.email}</span>
                </div>
              </div>
            </div>
            {getRiskBadge(student.riskPrediction?.riskLevel)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-4 p-6 border-b">
          <button
            onClick={getCareerRecommendation}
            disabled={loading}
            className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
          >
            <FiBriefcase className="h-6 w-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-700">Career Advice</span>
          </button>

          <button
            onClick={getPersonalizedAdvice}
            disabled={loading}
            className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition"
          >
            <FiTarget className="h-6 w-6 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-700">Personal Advice</span>
          </button>

          <button
            onClick={getAdaptiveLearningPath}
            disabled={loading}
            className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
          >
            <FiBookOpen className="h-6 w-6 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-700">Learning Path</span>
          </button>
        </div>

        {/* Content Tabs */}
        <div className="p-6">
          <div className="flex space-x-4 border-b mb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2 px-4 whitespace-nowrap ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('career')}
              className={`pb-2 px-4 whitespace-nowrap ${activeTab === 'career' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            >
              Career
            </button>
            <button
              onClick={() => setActiveTab('advice')}
              className={`pb-2 px-4 whitespace-nowrap ${activeTab === 'advice' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            >
              Advice
            </button>
            <button
              onClick={() => setActiveTab('learning')}
              className={`pb-2 px-4 whitespace-nowrap ${activeTab === 'learning' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            >
              Learning Path
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Academic Info</h3>
                  <p>Department: {student.department}</p>
                  <p>Semester: {student.semester}</p>
                  <p>CGPA: {student.cgpa}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Attendance</h3>
                  <p>Overall: {student.overallAttendance}%</p>
                  {student.attendance?.map((att, idx) => (
                    <p key={idx} className="text-sm">{att.subject}: {att.percentage}%</p>
                  ))}
                </div>
              </div>

              {student.riskPrediction && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Risk Factors</h3>
                  <ul className="list-disc pl-5">
                    {student.riskPrediction.factors?.map((factor, idx) => (
                      <li key={idx} className="text-sm text-gray-600">{factor}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Career Tab */}
          {activeTab === 'career' && careerData && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Recommended Careers</h3>
              {careerData.topCareers?.map((career, idx) => (
                <div key={idx} className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                    <h4 className="font-bold">{career.title}</h4>
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                      {career.match}% Match
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{career.description}</p>
                  <div className="mt-2">
                    <p className="text-sm font-medium">Required Skills:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {career.skills?.map((skill, i) => (
                        <span key={i} className="bg-white px-2 py-1 rounded text-xs">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {careerData.areasForImprovement?.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Areas to Improve</h4>
                  <ul className="list-disc pl-5">
                    {careerData.areasForImprovement.map((subject, idx) => (
                      <li key={idx} className="text-sm">{subject}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Advice Tab */}
          {activeTab === 'advice' && adviceData && (
            <div className="space-y-4">
              {adviceData.advice?.map((item, idx) => (
                <div key={idx} className={`p-4 rounded-lg ${
                  item.category === 'Critical Intervention' ? 'bg-red-50' : 'bg-green-50'
                }`}>
                  <h4 className="font-bold mb-2">{item.category}</h4>
                  <p className="text-sm mb-2">{item.message}</p>
                  <ul className="list-disc pl-5">
                    {item.tips?.map((tip, i) => (
                      <li key={i} className="text-sm text-gray-600">{tip}</li>
                    ))}
                  </ul>
                </div>
              ))}

              {adviceData.resources?.map((resource, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">{resource.title}</h4>
                  <div className="space-y-2">
                    {resource.links?.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-600 hover:underline text-sm"
                      >
                        {link.name}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Learning Path Tab */}
          {activeTab === 'learning' && learningPath && (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold mb-3 text-lg">Immediate Actions (1-2 weeks)</h4>
                {learningPath.immediate?.map((item, idx) => (
                  <div key={idx} className="bg-purple-50 p-4 rounded-lg mb-3">
                    <p className="font-semibold">{item.subject}</p>
                    <p className="text-sm mt-1">{item.action}</p>
                    <p className="text-xs text-gray-500 mt-2">Duration: {item.duration}</p>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-bold mb-3 text-lg">Short-term Goals (1-2 months)</h4>
                {learningPath.shortTerm?.map((item, idx) => (
                  <div key={idx} className="bg-blue-50 p-4 rounded-lg mb-3">
                    <p className="font-semibold">{item.goal}</p>
                    <ul className="list-disc pl-5 mt-2">
                      {item.milestones?.map((milestone, i) => (
                        <li key={i} className="text-sm">{milestone}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-bold mb-3 text-lg">Recommended Resources</h4>
                {learningPath.recommendedResources?.map((category, idx) => (
                  <div key={idx} className="mb-4">
                    <p className="text-md font-semibold mb-2 text-gray-700">{category.type}:</p>
                    <div className="flex flex-wrap gap-3">
                      {category.items?.map((item, i) => (
                        <a
                          key={i}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-100 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentCard;