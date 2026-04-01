import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiBookOpen, FiLogIn, FiUserPlus, FiShield, FiTrendingUp, FiAward, FiBarChart2 } from 'react-icons/fi';

const Auth = ({ setIsAuthenticated }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [adminExists, setAdminExists] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  // Check if admin already exists
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/check');
        setAdminExists(response.data.exists);
        setIsLogin(response.data.exists);
      } catch (error) {
        console.error('Error checking admin:', error);
      } finally {
        setChecking(false);
      }
    };
    checkAdmin();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!isLogin && !formData.name) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/login' : '/signup';
      const response = await axios.post(`http://localhost:5000/api/auth${endpoint}`, {
        email: formData.email,
        password: formData.password,
        ...(isLogin ? {} : { name: formData.name })
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('admin', JSON.stringify(response.data.admin));
        setIsAuthenticated(true);
        toast.success(isLogin ? 'Login successful!' : 'Account created successfully!');
        navigate('/');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full">
        <div className="grid md:grid-cols-2 gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Left Side - Form Section */}
          <div className="p-8 lg:p-10">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg">
                <FiBookOpen className="h-8 w-8 text-white" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-center text-gray-500 text-sm mb-8">
              {isLogin ? 'Sign in to access your dashboard' : 'Set up your admin account to get started'}
            </p>

            {/* Toggle Buttons */}
            <div className="flex rounded-xl bg-gray-100 p-1 mb-8">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isLogin
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiLogIn className="inline mr-2" />
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                disabled={adminExists}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  !isLogin && !adminExists
                    ? 'bg-white text-indigo-600 shadow-md'
                    : adminExists
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiUserPlus className="inline mr-2" />
                Signup
              </button>
            </div>

            {adminExists && !isLogin && (
              <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-700 text-center flex items-center justify-center gap-2">
                  <FiShield className="text-amber-500" />
                  Admin account already exists. Only one admin is allowed.
                </p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required={!isLogin}
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || (!isLogin && adminExists)}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                {isLogin ? (
                  <>Only one admin account exists. Contact administrator if you need access.</>
                ) : (
                  <>Initial setup - Only one admin account can be created.</>
                )}
              </p>
            </div>
          </div>

          {/* Right Side - Features Section */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 lg:p-10 flex flex-col justify-center">
            <div className="text-center mb-8">
              <FiBarChart2 className="h-16 w-16 text-white/80 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">AI Student Retention</h3>
              <p className="text-blue-100 text-sm">Predictive Analytics • Early Warning • Personalized Learning</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="bg-white/20 rounded-lg p-2">
                  <FiTrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">Risk Prediction</h4>
                  <p className="text-blue-100 text-xs mt-1">Identify at-risk students early with AI-powered analysis</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-white/20 rounded-lg p-2">
                  <FiMail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">Automated Alerts</h4>
                  <p className="text-blue-100 text-xs mt-1">Send early warning emails to students at risk</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-white/20 rounded-lg p-2">
                  <FiAward className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">Career Recommendations</h4>
                  <p className="text-blue-100 text-xs mt-1">AI-powered career guidance based on academic performance</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/20 text-center">
              <p className="text-blue-100 text-xs">
                Powered by Advanced Machine Learning
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            &copy; 2026 AI Student Retention System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;