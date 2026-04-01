import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  FiUpload, FiUsers, FiRefreshCw, FiHome, FiBell, 
  FiUser, FiMail, FiCalendar, FiGithub, FiTwitter, 
  FiLinkedin, FiMail as FiMailIcon, FiPhone, FiMapPin,
  FiTrendingUp, FiTrendingDown, FiAlertCircle, FiBookOpen,
  FiAward, FiClock, FiCheckCircle, FiXCircle
} from 'react-icons/fi';

const Dashboard = ({ students }) => {
  const [stats, setStats] = useState({
    total: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    notAnalyzed: 0
  });

  const [departmentData, setDepartmentData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    calculateStats();
    fetchRiskStats();
    
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [students]);

  const calculateStats = () => {
    const newStats = {
      total: students.length,
      highRisk: students.filter(s => s.riskPrediction?.riskLevel === 'high').length,
      mediumRisk: students.filter(s => s.riskPrediction?.riskLevel === 'medium').length,
      lowRisk: students.filter(s => s.riskPrediction?.riskLevel === 'low').length,
      notAnalyzed: students.filter(s => !s.riskPrediction).length
    };
    setStats(newStats);

    // Department wise analysis
    const depts = {};
    students.forEach(s => {
      if (!depts[s.department]) {
        depts[s.department] = { total: 0, high: 0, medium: 0, low: 0 };
      }
      depts[s.department].total++;
      if (s.riskPrediction) {
        depts[s.department][s.riskPrediction.riskLevel]++;
      }
    });

    const deptChartData = Object.keys(depts).map(dept => ({
      name: dept,
      high: depts[dept].high,
      medium: depts[dept].medium,
      low: depts[dept].low
    }));
    setDepartmentData(deptChartData);

    // Attendance distribution
    const attendanceRanges = [
      { range: '0-25%', count: 0, color: '#FF6B6B' },
      { range: '26-50%', count: 0, color: '#FFA26B' },
      { range: '51-75%', count: 0, color: '#FFD93D' },
      { range: '76-100%', count: 0, color: '#6BCB77' }
    ];

    students.forEach(s => {
      const att = s.overallAttendance || 0;
      if (att <= 25) attendanceRanges[0].count++;
      else if (att <= 50) attendanceRanges[1].count++;
      else if (att <= 75) attendanceRanges[2].count++;
      else attendanceRanges[3].count++;
    });
    setAttendanceData(attendanceRanges);
  };

  const fetchRiskStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/students/stats/risk');
      if (response.data) {
        // Update with server stats
      }
    } catch (error) {
      console.error('Failed to fetch risk stats:', error);
    }
  };

  const COLORS = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF'];

  const pieData = [
    { name: 'High Risk', value: stats.highRisk, color: '#FF6B6B' },
    { name: 'Medium Risk', value: stats.mediumRisk, color: '#FFD93D' },
    { name: 'Low Risk', value: stats.lowRisk, color: '#6BCB77' },
    { name: 'Not Analyzed', value: stats.notAnalyzed, color: '#4D96FF' }
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner - Professional Blue Gradient */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg shadow-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, Admin! 👋</h2>
            <p className="text-slate-300">Here's what's happening with your students today.</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-light">{formatTime(currentTime)}</p>
            <p className="text-sm text-slate-300">System Status: <span className="text-green-400">● Online</span></p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiUsers className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <span className="text-green-600">↑ 12%</span> from last month
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-red-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">High Risk</p>
              <p className="text-3xl font-bold text-red-600">{stats.highRisk}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <FiTrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Requires immediate attention
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Medium Risk</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.mediumRisk}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FiAlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Monitor closely
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Low Risk</p>
              <p className="text-3xl font-bold text-green-600">{stats.lowRisk}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FiTrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            On track
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Not Analyzed</p>
              <p className="text-3xl font-bold text-gray-600">{stats.notAnalyzed}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <FiClock className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Pending analysis
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Risk Distribution</h3>
          <div className="flex justify-center">
            <PieChart width={400} height={300}>
              <Pie
                data={pieData}
                cx={200}
                cy={150}
                labelLine={false}
                label={entry => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Department-wise Risk Analysis</h3>
          <BarChart width={400} height={300} data={departmentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="high" fill="#FF6B6B" />
            <Bar dataKey="medium" fill="#FFD93D" />
            <Bar dataKey="low" fill="#6BCB77" />
          </BarChart>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Attendance Distribution</h3>
          <BarChart width={400} height={300} data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#4D96FF" />
          </BarChart>
        </div>

        {/* Quick Actions - Fixed grid layout with proper spacing */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h3>
          <div className="flex flex-col space-y-3">
            <Link
              to="/upload"
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 w-full"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-100">Upload Data</p>
                  <p className="text-lg font-semibold">Import Students</p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <FiUpload className="h-6 w-6" />
                </div>
              </div>
            </Link>

            <Link
              to="/students"
              className="group relative overflow-hidden bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 w-full"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-100">View All</p>
                  <p className="text-lg font-semibold">Student List</p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <FiUsers className="h-6 w-6" />
                </div>
              </div>
            </Link>

            <button
              onClick={() => window.location.reload()}
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 w-full"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-100">Refresh</p>
                  <p className="text-lg font-semibold">Update Analysis</p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <FiRefreshCw className="h-6 w-6 group-hover:rotate-180 transition-transform duration-500" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* High Risk Students - Grid Layout */}
      {stats.highRisk > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">High Risk Students</h3>
              <p className="text-sm text-gray-500">Immediate attention required</p>
            </div>
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
              {stats.highRisk} Students
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {students.filter(s => s.riskPrediction?.riskLevel === 'high').slice(0, 8).map(student => (
              <div key={student._id} className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {student.name?.charAt(0) || 'S'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{student.name}</h4>
                      <p className="text-xs text-gray-600">ID: {student.studentId}</p>
                    </div>
                  </div>
                  <FiAlertCircle className="h-5 w-5 text-red-500" />
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">CGPA:</span>
                    <span className="font-medium text-red-600">{student.cgpa}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Attendance:</span>
                    <span className="font-medium text-red-600">{student.overallAttendance}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium text-gray-700">{student.department}</span>
                  </div>
                </div>

                <Link
                  to={`/student/${student._id}`}
                  className="block w-full bg-red-600 text-white text-center py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-300"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>

          {stats.highRisk > 8 && (
            <div className="mt-4 text-center">
              <Link to="/students?risk=high" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all {stats.highRisk} high risk students →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;