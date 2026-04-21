from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import json

app = Flask(__name__)
CORS(app)

# Load pre-trained models or create them
class RiskPredictor:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
    
    def predict_risk(self, student_data):
        # Extract features
        features = self.extract_features(student_data)
        
        # Simple rule-based prediction for demo
        risk_score = 0
        factors = []
        
        # Academic performance
        cgpa = student_data.get('cgpa', 0)
        if cgpa < 2.0:
            risk_score += 40
            factors.append("Very low CGPA (below 2.0)")
        elif cgpa < 2.5:
            risk_score += 25
            factors.append("Low CGPA (below 2.5)")
        elif cgpa < 3.0:
            risk_score += 10
            factors.append("Below average CGPA")
        
        # Attendance
        attendance = student_data.get('overallAttendance', 100)
        if attendance < 60:
            risk_score += 30
            factors.append("Critical attendance (below 60%)")
        elif attendance < 75:
            risk_score += 20
            factors.append("Poor attendance (below 75%)")
        elif attendance < 85:
            risk_score += 10
            factors.append("Below recommended attendance")
        
        # LMS Activity
        lms = student_data.get('lmsActivity', {})
        if isinstance(lms, dict):
            logins = lms.get('averageLoginPerWeek', 0)
            if logins < 2:
                risk_score += 25
                factors.append("Very low LMS engagement")
            elif logins < 4:
                risk_score += 15
                factors.append("Low LMS engagement")
        
        # Financial status
        financial = student_data.get('financialStatus', {})
        if isinstance(financial, dict):
            if not financial.get('tuitionPaid', True):
                risk_score += 35
                factors.append("Tuition payment pending")
            if financial.get('paymentDelays', 0) > 1:
                risk_score += 20
                factors.append("Multiple payment delays")
        
        # Determine risk level
        if risk_score >= 60:
            risk_level = "high"
        elif risk_score >= 30:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        return {
            "riskLevel": risk_level,
            "riskScore": min(risk_score, 100),
            "factors": factors[:3]  # Return top 3 factors
        }
    
    def extract_features(self, student_data):
        features = []
        # Implement feature extraction logic
        return features

class CareerRecommender:
    def recommend(self, student_data):
        academic = student_data.get('academicPerformance', [])
        
        # Analyze subject scores
        subject_scores = {}
        for record in academic:
            if isinstance(record, dict):
                subject = record.get('subject', '')
                score = record.get('score', 0)
                subject_scores[subject] = score
        
        # Determine strengths
        strong_subjects = [sub for sub, score in subject_scores.items() if score > 80]
        avg_subjects = [sub for sub, score in subject_scores.items() if 60 <= score <= 80]
        weak_subjects = [sub for sub, score in subject_scores.items() if score < 60]
        
        # Career recommendations based on subject performance
        careers = []
        
        if 'Programming' in strong_subjects or 'Computer Science' in strong_subjects:
            careers.append({
                "title": "Software Developer",
                "match": 95,
                "description": "Strong programming skills indicate aptitude for software development",
                "skills": ["Python", "JavaScript", "Data Structures", "Algorithms"],
                "courses": ["Advanced Programming", "Web Development", "Database Management"]
            })
            careers.append({
                "title": "Full Stack Developer",
                "match": 90,
                "description": "Good foundation in programming with potential for web development",
                "skills": ["HTML/CSS", "JavaScript", "React", "Node.js", "MongoDB"],
                "courses": ["Frontend Development", "Backend Development", "DevOps"]
            })
        
        if 'Mathematics' in strong_subjects or 'Statistics' in strong_subjects:
            careers.append({
                "title": "Data Scientist",
                "match": 92,
                "description": "Strong mathematical background suitable for data science",
                "skills": ["Python", "R", "Machine Learning", "Statistics", "Data Visualization"],
                "courses": ["Machine Learning", "Statistical Analysis", "Big Data Analytics"]
            })
        
        if 'Database' in strong_subjects or 'Data Management' in strong_subjects:
            careers.append({
                "title": "Database Administrator",
                "match": 88,
                "description": "Good understanding of data management principles",
                "skills": ["SQL", "Database Design", "Performance Tuning", "Backup Recovery"],
                "courses": ["Advanced Database", "Data Warehousing", "Cloud Databases"]
            })
        
        if 'Networking' in strong_subjects:
            careers.append({
                "title": "Network Engineer",
                "match": 85,
                "description": "Strong networking knowledge",
                "skills": ["TCP/IP", "Routing", "Switching", "Network Security"],
                "courses": ["Advanced Networking", "Network Security", "Cloud Networking"]
            })
        
        # Default recommendations if no strong subjects
        if not careers:
            careers = [
                {
                    "title": "IT Support Specialist",
                    "match": 75,
                    "description": "General IT skills with potential for technical support",
                    "skills": ["Troubleshooting", "Customer Service", "Basic Networking"],
                    "courses": ["IT Fundamentals", "Help Desk Support", "System Administration"]
                },
                {
                    "title": "Business Analyst",
                    "match": 70,
                    "description": "Analytical skills suitable for business analysis",
                    "skills": ["Data Analysis", "Requirements Gathering", "Process Modeling"],
                    "courses": ["Business Analysis", "Project Management", "SQL"]
                }
            ]
        
        return {
            "topCareers": careers[:3],
            "strongSubjects": strong_subjects,
            "areasForImprovement": weak_subjects,
            "recommendedPath": careers[0] if careers else None
        }

class PersonalizedAdvisor:
    def get_advice(self, student_data):
        advice = []
        resources = []
        
        academic = student_data.get('academicPerformance', [])
        cgpa = student_data.get('cgpa', 0)
        attendance = student_data.get('overallAttendance', 100)
        risk_level = student_data.get('riskLevel', 'low')
        
        # Academic advice
        if cgpa < 2.5:
            advice.append({
                "category": "Academic Performance",
                "message": "Your CGPA needs immediate attention. Consider these strategies:",
                "tips": [
                    "Meet with your academic advisor weekly",
                    "Join study groups for difficult subjects",
                    "Use tutoring services available on campus",
                    "Create a structured study schedule"
                ]
            })
            
            resources.append({
                "title": "Academic Improvement Resources",
                "links": [
                    {"name": "Khan Academy - Subject Reviews", "url": "https://www.khanacademy.org"},
                    {"name": "Coursera - Academic Skills", "url": "https://www.coursera.org"},
                    {"name": "University Tutoring Center", "url": "#"}
                ]
            })
        
        # Subject-specific advice
        weak_subjects = []
        for record in academic:
            if isinstance(record, dict) and record.get('score', 100) < 60:
                weak_subjects.append(record.get('subject', ''))
        
        if weak_subjects:
            subject_advice = {
                "category": "Subject Improvement",
                "message": f"Focus on improving in: {', '.join(weak_subjects)}",
                "tips": []
            }
            
            for subject in weak_subjects:
                if "Programming" in subject or "Computer" in subject:
                    subject_advice["tips"].append(f"Practice coding daily on platforms like LeetCode or HackerRank")
                    subject_advice["tips"].append(f"Build small projects to apply {subject} concepts")
                elif "Math" in subject:
                    subject_advice["tips"].append(f"Practice problems daily from textbooks")
                    subject_advice["tips"].append(f"Use online resources like Khan Academy for {subject}")
                else:
                    subject_advice["tips"].append(f"Create concept maps for {subject}")
                    subject_advice["tips"].append(f"Form study groups for {subject}")
            
            advice.append(subject_advice)
        
        # Attendance advice
        if attendance < 75:
            advice.append({
                "category": "Attendance",
                "message": "Your attendance is below the recommended level",
                "tips": [
                    "Set alarms and reminders for all classes",
                    "Contact professors for missed material",
                    "Aim for 100% attendance in the next two weeks",
                    "Use the attendance tracking feature in your student portal"
                ]
            })
        
        # Risk-specific advice
        if risk_level == 'high':
            advice.append({
                "category": "Critical Intervention",
                "message": "Immediate action required to prevent academic failure",
                "tips": [
                    "Schedule emergency meeting with academic advisor TODAY",
                    "Contact student counseling services for support",
                    "Review withdrawal/drop policies if necessary",
                    "Create an academic recovery plan"
                ]
            })
        
        # General study resources
        resources.append({
            "title": "Study Resources and Tools",
            "links": [
                {"name": "Quizlet - Flashcards", "url": "https://quizlet.com"},
                {"name": "Wolfram Alpha - Problem Solver", "url": "https://wolframalpha.com"},
                {"name": "Google Scholar - Research", "url": "https://scholar.google.com"},
                {"name": "LinkedIn Learning - Video Courses", "url": "https://linkedin.com/learning"}
            ]
        })
        
        return {
            "advice": advice,
            "resources": resources,
            "priority": "high" if risk_level == 'high' else "medium" if risk_level == 'medium' else "low"
        }

class AdaptiveLearningPath:
    def generate_path(self, student_data):
        academic = student_data.get('academicPerformance', [])
        weak_subjects = student_data.get('weakSubjects', [])
        strong_subjects = student_data.get('strongSubjects', [])
        
        learning_path = {
            "immediate": [],
            "shortTerm": [],
            "longTerm": [],
            "recommendedResources": []
        }
        
        # Immediate actions (next 1-2 weeks)
        if weak_subjects:
            for subject in weak_subjects[:2]:
                learning_path["immediate"].append({
                    "subject": subject,
                    "action": f"Master fundamental concepts in {subject}",
                    "duration": "1-2 weeks",
                    "resources": [
                        f"Complete beginner tutorials for {subject}",
                        f"Practice basic problems in {subject}",
                        f"Join study group for {subject}"
                    ]
                })
        
        # Short-term goals (1-2 months)
        for subject in weak_subjects:
            learning_path["shortTerm"].append({
                "subject": subject,
                "goal": f"Achieve proficiency in {subject}",
                "milestones": [
                    f"Score above 70% in {subject} quizzes",
                    f"Complete all assignments for {subject}",
                    f"Participate in {subject} discussions"
                ]
            })
        
        # Long-term development (semester)
        if strong_subjects:
            for subject in strong_subjects[:2]:
                learning_path["longTerm"].append({
                    "subject": subject,
                    "goal": f"Excel in {subject} and explore advanced topics",
                    "opportunities": [
                        f"Take advanced courses in {subject}",
                        f"Work on projects related to {subject}",
                        f"Consider {subject} for specialization"
                    ]
                })
        
        # Recommended resources
        learning_path["recommendedResources"] = [
            {
                "type": "Video Courses",
                "items": [
                    {"name": "Coursera - Subject Specializations", "url": "https://coursera.org"},
                    {"name": "edX - University Courses", "url": "https://edx.org"}
                ]
            },
            {
                "type": "Practice Platforms",
                "items": [
                    {"name": "LeetCode - Coding Practice", "url": "https://leetcode.com"},
                    {"name": "Khan Academy - Math & Science", "url": "https://khanacademy.org"}
                ]
            },
            {
                "type": "Study Tools",
                "items": [
                    {"name": "Notion - Study Organization", "url": "https://notion.so"},
                    {"name": "Anki - Flashcards", "url": "https://apps.ankiweb.net"}
                ]
            }
        ]
        
        # Weekly schedule recommendation
        learning_path["recommendedSchedule"] = {
            "weekdays": "2-3 hours daily study",
            "weekends": "4-5 hours focused study",
            "breakdown": {
                "weakSubjects": "60% of study time",
                "assignments": "25% of study time",
                "review": "15% of study time"
            }
        }
        
        return learning_path

# Initialize services
risk_predictor = RiskPredictor()
career_recommender = CareerRecommender()
personalized_advisor = PersonalizedAdvisor()
adaptive_learning = AdaptiveLearningPath()

@app.route('/predict-risk', methods=['POST'])
def predict_risk():
    data = request.json
    result = risk_predictor.predict_risk(data)
    return jsonify(result)

@app.route('/recommend-career', methods=['POST'])
def recommend_career():
    data = request.json
    result = career_recommender.recommend(data)
    return jsonify(result)

@app.route('/personalized-advice', methods=['POST'])
def personalized_advice():
    data = request.json
    result = personalized_advisor.get_advice(data)
    return jsonify(result)

@app.route('/adaptive-learning', methods=['POST'])
def adaptive_learning_path():
    data = request.json
    result = adaptive_learning.generate_path(data)
    return jsonify(result)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "ML Service Running"})

if __name__ == '__main__':
    app.run(host='0.0.0.0')
