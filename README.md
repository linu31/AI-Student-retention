# AI Student Retention System

An intelligent, AI-powered platform designed to predict student dropout risk and provide personalized interventions for academic success.

## 🚀 Features

### 🤖 AI-Powered Analytics
- **Risk Prediction**: ML models analyze academic performance, attendance, LMS activity, and financial patterns to predict student risk levels (Low/Medium/High)
- **Early Warning System**: Automated email alerts sent to at-risk students with personalized recommendations
- **Career Recommendations**: AI-driven career path suggestions based on subject proficiency
- **Personalized Academic Advising**: Tailored study advice and resource recommendations
- **Adaptive Learning Pathways**: Customized learning plans based on student strengths and weaknesses

### 📊 Dashboard & Analytics
- Real-time risk distribution visualizations
- Department-wise risk analysis
- Attendance tracking and trends
- Interactive charts using Recharts

### 🔐 Authentication
- Secure JWT-based authentication
- Single admin account (max 2 admins)
- Protected routes and session management

### 📱 Student Management
- CSV upload for bulk student data import
- Student list with pagination and filtering
- Detailed student profiles with risk factors
- Grid view for high-risk students

### 🔔 Notifications
- Real-time notification panel
- Automated email alerts for at-risk students
- Mark as read/delete functionality
- Risk-based notification prioritization

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **React Router** - Navigation
- **Axios** - API calls
- **React Hot Toast** - Notifications
- **React Icons** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Nodemailer** - Email service
- **Multer** - File upload handling

### Machine Learning
- **Python** - ML service
- **Flask** - API framework
- **Scikit-learn** - ML algorithms
- **Pandas** - Data processing
- **NumPy** - Numerical computing

## 📋 Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- MongoDB (v4.0 or higher)
- npm or yarn package manager

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/student-retention-system.git
cd student-retention-system
