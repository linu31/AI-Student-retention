import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
import joblib
import json
import os

class RiskPredictor:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.feature_columns = [
            'cgpa', 'attendance', 'lms_logins', 'assignments_completion',
            'payment_delays', 'previous_cgpa_drop', 'failed_subjects',
            'forum_posts', 'quiz_avg_score', 'age', 'semester'
        ]
        
    def extract_features(self, student_data):
        """Extract numerical features from student data"""
        features = []
        
        # Academic features
        features.append(float(student_data.get('cgpa', 0)))
        
        # Attendance
        attendance = student_data.get('overallAttendance', 0)
        if isinstance(attendance, str):
            attendance = float(attendance.rstrip('%'))
        features.append(float(attendance))
        
        # LMS Activity
        lms = student_data.get('lmsActivity', {})
        if isinstance(lms, dict):
            features.append(float(lms.get('averageLoginPerWeek', 0)))
            
            assignments_submitted = float(lms.get('assignmentsSubmitted', 0))
            total_assignments = float(lms.get('totalAssignments', 1))
            completion_rate = (assignments_submitted / total_assignments) * 100 if total_assignments > 0 else 0
            features.append(completion_rate)
            
            forum_posts = float(lms.get('forumPosts', 0))
            
            quiz_scores = lms.get('quizScores', [])
            quiz_avg = np.mean(quiz_scores) if quiz_scores else 0
        else:
            features.extend([0, 0, 0, 0])
            forum_posts = 0
            quiz_avg = 0
        
        # Financial features
        financial = student_data.get('financialStatus', {})
        if isinstance(financial, dict):
            features.append(float(financial.get('paymentDelays', 0)))
        else:
            features.append(0)
        
        # Academic performance trends
        academic_records = student_data.get('academicRecords', [])
        if academic_records:
            current_scores = [r.get('score', 0) for r in academic_records[-3:]] if len(academic_records) >= 3 else []
            previous_scores = [r.get('score', 0) for r in academic_records[:-3]] if len(academic_records) > 3 else []
            
            if current_scores and previous_scores:
                cgpa_drop = np.mean(previous_scores) - np.mean(current_scores)
            else:
                cgpa_drop = 0
                
            failed_subjects = sum(1 for r in academic_records if r.get('score', 100) < 40)
        else:
            cgpa_drop = 0
            failed_subjects = 0
        
        features.append(cgpa_drop)
        features.append(failed_subjects)
        features.append(forum_posts)
        features.append(quiz_avg)
        
        # Demographics
        features.append(float(student_data.get('age', 20)))
        features.append(float(student_data.get('semester', 1)))
        
        return np.array(features).reshape(1, -1)
    
    def predict_risk_advanced(self, student_data):
        """Advanced risk prediction using multiple factors"""
        risk_score = 0
        factors = []
        
        # Academic performance (40% weight)
        cgpa = float(student_data.get('cgpa', 0))
        if cgpa < 1.5:
            risk_score += 35
            factors.append("Critical academic performance - CGPA below 1.5")
        elif cgpa < 2.0:
            risk_score += 30
            factors.append("Very poor academic performance - CGPA below 2.0")
        elif cgpa < 2.5:
            risk_score += 20
            factors.append("Poor academic performance - CGPA below 2.5")
        elif cgpa < 3.0:
            risk_score += 10
            factors.append("Below average academic performance")
        
        # Subject-wise performance
        academic_records = student_data.get('academicRecords', [])
        if academic_records:
            failed_subjects = sum(1 for r in academic_records if r.get('score', 100) < 40)
            if failed_subjects >= 3:
                risk_score += 25
                factors.append(f"Failed {failed_subjects} subjects")
            elif failed_subjects >= 1:
                risk_score += 15
                factors.append(f"Failed {failed_subjects} subject(s)")
        
        # Attendance (25% weight)
        attendance = student_data.get('overallAttendance', 100)
        if isinstance(attendance, str):
            attendance = float(attendance.rstrip('%'))
        
        if attendance < 50:
            risk_score += 25
            factors.append("Critical attendance - below 50%")
        elif attendance < 65:
            risk_score += 20
            factors.append("Very poor attendance - below 65%")
        elif attendance < 75:
            risk_score += 15
            factors.append("Poor attendance - below recommended 75%")
        elif attendance < 85:
            risk_score += 5
            factors.append("Below average attendance")
        
        # LMS Engagement (20% weight)
        lms = student_data.get('lmsActivity', {})
        if isinstance(lms, dict):
            logins = float(lms.get('averageLoginPerWeek', 0))
            if logins < 1:
                risk_score += 15
                factors.append("Critically low LMS engagement")
            elif logins < 3:
                risk_score += 10
                factors.append("Low LMS engagement")
            
            assignments_submitted = float(lms.get('assignmentsSubmitted', 0))
            total_assignments = float(lms.get('totalAssignments', 1))
            if total_assignments > 0:
                completion_rate = (assignments_submitted / total_assignments) * 100
                if completion_rate < 50:
                    risk_score += 15
                    factors.append("Very low assignment completion")
                elif completion_rate < 70:
                    risk_score += 10
                    factors.append("Low assignment completion")
        
        # Financial stability (15% weight)
        financial = student_data.get('financialStatus', {})
        if isinstance(financial, dict):
            payment_delays = float(financial.get('paymentDelays', 0))
            if payment_delays >= 3:
                risk_score += 15
                factors.append("Multiple payment delays")
            elif payment_delays >= 1:
                risk_score += 10
                factors.append("Payment delays")
            
            if not financial.get('tuitionPaid', True):
                risk_score += 20
                factors.append("Tuition payment pending")
        
        # Determine risk level
        if risk_score >= 70:
            risk_level = "high"
        elif risk_score >= 40:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        return {
            "riskLevel": risk_level,
            "riskScore": min(risk_score, 100),
            "factors": list(set(factors))[:5]  # Return unique factors, max 5
        }
    
    def train_model(self, training_data):
        """Train ML model on historical data"""
        X = []
        y = []
        
        for student in training_data:
            features = self.extract_features(student)
            X.append(features.flatten())
            y.append(student.get('actual_outcome', 0))  # 0: retained, 1: dropped out
        
        X = np.array(X)
        y = np.array(y)
        
        # Train model
        self.model = GradientBoostingClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            random_state=42
        )
        
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        
        # Save model
        joblib.dump(self.model, 'models/risk_model.pkl')
        joblib.dump(self.scaler, 'models/scaler.pkl')
        
        return {
            "accuracy": float(self.model.score(X_scaled, y)),
            "feature_importance": dict(zip(self.feature_columns, self.model.feature_importances_))
        }
    
    def load_model(self):
        """Load pre-trained model"""
        try:
            self.model = joblib.load('models/risk_model.pkl')
            self.scaler = joblib.load('models/scaler.pkl')
            return True
        except:
            return False

# Singleton instance
risk_predictor = RiskPredictor()