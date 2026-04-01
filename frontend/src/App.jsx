import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import StudentCard from './components/StudentCard';
import FileUpload from './components/FileUpload';
import Auth from './components/Auth';
import toast from 'react-hot-toast';
import { FiLogOut } from 'react-icons/fi';
import RiskAnalysis from './components/RiskAnalysis';
import NotificationsPanel from './components/NotificationsPanel';
import { Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { 
  FiHome, FiBell, FiBookOpen, FiGithub, FiTwitter, 
  FiLinkedin, FiMail, FiPhone, FiMapPin, FiYoutube,
  FiInstagram, FiFacebook, FiGlobe, FiHeart
} from 'react-icons/fi';
import './index.css';

function App() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check authentication on mount
useEffect(() => {
  const token = localStorage.getItem('token');
  const adminData = localStorage.getItem('admin');
  
  if (token && adminData) {
    setIsAuthenticated(true);
    setAdmin(JSON.parse(adminData));
  }
  setAuthLoading(false);
}, []);

  // Update notifications when students change
  useEffect(() => {
    if (students.length > 0) {
      generateNotifications();
    }
  }, [students]);

  const generateNotifications = () => {
    try {
      const highRiskStudents = students.filter(s => s.riskPrediction?.riskLevel === 'high');
      const mediumRiskStudents = students.filter(s => s.riskPrediction?.riskLevel === 'medium');
      
      const newNotifications = [];
      
      // Create notifications for high risk students
      highRiskStudents.forEach(student => {
        const studentId = student._id || student.id;
        if (studentId) {
          newNotifications.push({
            id: `high-${studentId}-${Date.now()}-${Math.random()}`,
            studentId: studentId,
            studentName: student.name || 'Unknown Student',
            riskLevel: 'high',
            message: `⚠️ URGENT: Early warning email sent to ${student.name || 'student'}`,
            time: new Date().toISOString(),
            read: false,
            details: {
              cgpa: student.cgpa || 'N/A',
              attendance: student.overallAttendance || 'N/A',
              factors: student.riskPrediction?.factors || ['Academic performance']
            }
          });
        }
      });

      // Create notifications for medium risk students
      mediumRiskStudents.forEach(student => {
        const studentId = student._id || student.id;
        if (studentId) {
          newNotifications.push({
            id: `medium-${studentId}-${Date.now()}-${Math.random()}`,
            studentId: studentId,
            studentName: student.name || 'Unknown Student',
            riskLevel: 'medium',
            message: `⚠️ Early warning email sent to ${student.name || 'student'}`,
            time: new Date().toISOString(),
            read: false,
            details: {
              cgpa: student.cgpa || 'N/A',
              attendance: student.overallAttendance || 'N/A',
              factors: student.riskPrediction?.factors || ['Monitor closely']
            }
          });
        }
      });

      // Sort by time (newest first)
      newNotifications.sort((a, b) => new Date(b.time) - new Date(a.time));
      
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.length);
    } catch (error) {
      console.error('Error generating notifications:', error);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setIsAuthenticated(false);
    setAdmin(null);
    toast.success('Logged out successfully');
    setTimeout(() => {
      window.location.href = '/auth';
    } , 1000); 
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => {
      const notificationToDelete = prev.find(n => n.id === notificationId);
      const filtered = prev.filter(n => n.id !== notificationId);
      
      if (notificationToDelete && !notificationToDelete.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return filtered;
    });
  };

  // Protected Route Component
const ProtectedRoute = ({ children }) => {
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now - notifTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Navigation component
  const Navigation = () => {
    const location = useLocation();
    
    return (
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Title */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <FiBookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Student Retention System
                </h1>
                <p className="text-xs text-gray-500">Smart Analytics • Predictive Insights • Personalized Learning</p>
              </div>
            </Link>

            {/* Right side - Dashboard Active, Notification and User */}
            <div className="flex items-center space-x-6">
              {/* Dashboard Active with green dot */}
              <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full">
                <FiHome className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Dashboard</span>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </div>

              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <FiBell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Panel */}
                {showNotifications && (
                  <NotificationsPanel
                    notifications={notifications}
                    unreadCount={unreadCount}
                    onMarkAsRead={markAsRead}
                    onMarkAllAsRead={markAllAsRead}
                    onDelete={deleteNotification}
                    onClose={() => setShowNotifications(false)}
                    formatTimeAgo={formatTimeAgo}
                  />
                )}
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
  <div className="text-right">
    <p className="text-sm font-medium text-gray-700">{admin?.name || 'Admin'}</p>
    <p className="text-xs text-gray-500">{formatDate(currentTime)}</p>
  </div>
  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
    <span className="text-white font-medium text-sm">
      {admin?.name?.charAt(0) || 'A'}
    </span>
  </div>
  <button
    onClick={handleLogout}
    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
    title="Logout"
  >
    <FiLogOut className="h-5 w-5" />
  </button>
</div>
            </div>
          </div>
        </div>
      </header>
    );
  };

  // Footer Component - Full version without newsletter
  const Footer = () => (
    <footer className="bg-gray-900 text-white mt-auto">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <FiBookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">AI Retention System</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering educational institutions with AI-driven student success analytics, 
              predictive insights, and personalized learning pathways.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FiFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FiTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FiInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FiLinkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FiGithub className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FiYoutube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/students" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Student List
                </Link>
              </li>
              <li>
                <Link to="/upload" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Upload Data
                </Link>
              </li>
              <li>
                <Link to="/analysis" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Risk Analysis
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Support Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Tutorials & Guides
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-gray-400 text-sm">
                <FiMail className="h-5 w-5 flex-shrink-0" />
                <span>support@studentretention.ai</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400 text-sm">
                <FiPhone className="h-5 w-5 flex-shrink-0" />
                <span>+91 7032565203</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400 text-sm">
                <FiMapPin className="h-5 w-5 flex-shrink-0" />
                <span>Vignan University, Vadlamudi</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400 text-sm">
                <FiGlobe className="h-5 w-5 flex-shrink-0" />
                <span>Student Retention</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2026 AI Student Retention System. All rights reserved. | Developed by Royal Challengers
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Accessibility</a>
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              Version 2.0.1 | Last updated: March 2026 | System Status: 
              <span className="inline-flex items-center ml-1">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
                Online
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
  <Route path="/auth" element={<Auth setIsAuthenticated={setIsAuthenticated} />} />
  <Route path="/" element={<Dashboard students={students} />} />
  <Route path="/students" element={
    <StudentList 
      students={students} 
      setStudents={setStudents}
      onSelectStudent={setSelectedStudent}
    />
  } />
  <Route path="/upload" element={<FileUpload setStudents={setStudents} />} />
  <Route path="/student/:id" element={
    <StudentCard 
      student={selectedStudent}
      setStudent={setSelectedStudent}
    />
  } />
  <Route path="/analysis" element={<RiskAnalysis students={students} />} />
</Routes>
        </main>

        <Footer />
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;