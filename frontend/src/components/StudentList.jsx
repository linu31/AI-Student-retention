import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiTrendingUp, FiTrendingDown, FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const StudentList = ({ students, setStudents, onSelectStudent }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to load students');
    }
  };

  const analyzeAllStudents = async () => {
    try {
      toast.loading('Analyzing all students...');
      const response = await axios.post('http://localhost:5000/api/ml/analyze-all');
      toast.dismiss();
      if (response.data.success) {
        toast.success(`Analysis complete for ${response.data.analyzedCount} students`);
        fetchStudents(); // Refresh data
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Analysis failed');
    }
  };

  const filteredStudents = students.filter(student => {
    if (filter !== 'all' && student.riskPrediction?.riskLevel !== filter) {
      return false;
    }
    if (searchTerm && !student.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !student.studentId.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getRiskBadge = (risk) => {
    switch(risk) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Pagination controls
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="w-[85%] mx-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </button>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Students</h2>
            <button
              onClick={analyzeAllStudents}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Analyze All Students
            </button>
          </div>

          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="flex-1 border rounded-md px-4 py-2"
            />
            
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
              className="border rounded-md px-4 py-2"
            >
              <option value="all">All Risk Levels</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
          </div>
        </div>

        {/* Rectangle Cards Grid Layout */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentStudents.map((student) => (
              <div 
                key={student._id} 
                className={`rounded-xl border-2 ${getRiskColor(student.riskPrediction?.riskLevel)} bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden`}
              >
                {/* Risk Badge */}
                <div className={`${getRiskBadge(student.riskPrediction?.riskLevel)} px-3 py-1 text-white text-xs font-medium`}>
                  {student.riskPrediction?.riskLevel ? student.riskPrediction.riskLevel.toUpperCase() : 'NOT ANALYZED'} RISK
                </div>
                
                {/* Student Info */}
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                      student.riskPrediction?.riskLevel === 'high' ? 'bg-red-500' :
                      student.riskPrediction?.riskLevel === 'medium' ? 'bg-yellow-500' :
                      student.riskPrediction?.riskLevel === 'low' ? 'bg-green-500' :
                      'bg-gray-500'
                    }`}>
                      {student.name?.charAt(0) || 'S'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">{student.name}</h3>
                      <p className="text-xs text-gray-500">ID: {student.studentId}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <FiMail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 truncate">{student.email}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500">CGPA</p>
                        <p className="text-lg font-bold text-gray-800">{student.cgpa || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500">Attendance</p>
                        <p className="text-lg font-bold text-gray-800">{student.overallAttendance || 0}%</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 pt-1">
                      <span className="font-medium">Department:</span> {student.department || 'N/A'}
                    </div>
                  </div>

                  <Link
                    to={`/student/${student._id}`}
                    onClick={() => onSelectStudent(student)}
                    className={`block w-full text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-300 ${
                      student.riskPrediction?.riskLevel === 'high' ? 'bg-red-600 hover:bg-red-700' :
                      student.riskPrediction?.riskLevel === 'medium' ? 'bg-yellow-600 hover:bg-yellow-700' :
                      student.riskPrediction?.riskLevel === 'low' ? 'bg-green-600 hover:bg-green-700' :
                      'bg-indigo-600 hover:bg-indigo-700'
                    } text-white`}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8 pt-4 border-t">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FiChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="flex space-x-2">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  if (pageNum <= totalPages && pageNum > 0) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors duration-200 ${
                          currentPage === pageNum
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FiChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Showing Info */}
          <div className="text-center mt-4 text-sm text-gray-500">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStudents.length)} of {filteredStudents.length} students
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentList;