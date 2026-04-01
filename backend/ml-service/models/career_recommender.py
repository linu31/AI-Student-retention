import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import json

class CareerRecommender:
    def __init__(self):
        self.career_paths = {
            "software_development": {
                "title": "Software Developer",
                "required_skills": ["Programming", "Algorithms", "Data Structures", "Problem Solving"],
                "preferred_subjects": ["Programming", "Computer Science", "Algorithms", "Data Structures"],
                "min_cgpa": 3.0,
                "growth_potential": "High",
                "average_salary": "$85,000 - $120,000",
                "demand": "Very High"
            },
            "full_stack_development": {
                "title": "Full Stack Developer",
                "required_skills": ["HTML/CSS", "JavaScript", "React", "Node.js", "Databases", "API Design"],
                "preferred_subjects": ["Web Development", "Programming", "Database", "Networks"],
                "min_cgpa": 2.8,
                "growth_potential": "Very High",
                "average_salary": "$90,000 - $130,000",
                "demand": "Very High"
            },
            "data_science": {
                "title": "Data Scientist",
                "required_skills": ["Python", "Statistics", "Machine Learning", "SQL", "Data Visualization"],
                "preferred_subjects": ["Mathematics", "Statistics", "Programming", "Machine Learning"],
                "min_cgpa": 3.2,
                "growth_potential": "Very High",
                "average_salary": "$95,000 - $140,000",
                "demand": "High"
            },
            "cybersecurity": {
                "title": "Cybersecurity Analyst",
                "required_skills": ["Network Security", "Ethical Hacking", "Risk Assessment", "Security Tools"],
                "preferred_subjects": ["Networks", "Security", "Operating Systems", "Cryptography"],
                "min_cgpa": 2.9,
                "growth_potential": "High",
                "average_salary": "$85,000 - $125,000",
                "demand": "Very High"
            },
            "cloud_architecture": {
                "title": "Cloud Architect",
                "required_skills": ["AWS/Azure", "DevOps", "Containerization", "Infrastructure as Code"],
                "preferred_subjects": ["Networks", "Distributed Systems", "Operating Systems"],
                "min_cgpa": 3.0,
                "growth_potential": "Very High",
                "average_salary": "$110,000 - $160,000",
                "demand": "High"
            },
            "devops_engineering": {
                "title": "DevOps Engineer",
                "required_skills": ["CI/CD", "Docker", "Kubernetes", "Scripting", "Cloud Platforms"],
                "preferred_subjects": ["Linux", "Networks", "Programming", "Systems"],
                "min_cgpa": 2.8,
                "growth_potential": "High",
                "average_salary": "$95,000 - $135,000",
                "demand": "Very High"
            },
            "ai_engineering": {
                "title": "AI Engineer",
                "required_skills": ["Deep Learning", "NLP", "Computer Vision", "TensorFlow/PyTorch"],
                "preferred_subjects": ["AI", "Machine Learning", "Mathematics", "Programming"],
                "min_cgpa": 3.3,
                "growth_potential": "Very High",
                "average_salary": "$115,000 - $165,000",
                "demand": "Very High"
            },
            "database_administration": {
                "title": "Database Administrator",
                "required_skills": ["SQL", "Database Design", "Performance Tuning", "Backup Recovery"],
                "preferred_subjects": ["Database", "SQL", "Data Management"],
                "min_cgpa": 2.7,
                "growth_potential": "Medium",
                "average_salary": "$75,000 - $110,000",
                "demand": "Medium"
            },
            "it_project_management": {
                "title": "IT Project Manager",
                "required_skills": ["Agile/Scrum", "Team Leadership", "Budgeting", "Risk Management"],
                "preferred_subjects": ["Management", "Communication", "Any Technical"],
                "min_cgpa": 2.8,
                "growth_potential": "High",
                "average_salary": "$90,000 - $130,000",
                "demand": "High"
            },
            "technical_writing": {
                "title": "Technical Writer",
                "required_skills": ["Technical Writing", "Documentation", "Communication", "API Documentation"],
                "preferred_subjects": ["English", "Communication", "Any Technical"],
                "min_cgpa": 2.5,
                "growth_potential": "Medium",
                "average_salary": "$65,000 - $95,000",
                "demand": "Medium"
            }
        }
        
        self.learning_resources = {
            "software_development": [
                {"name": "LeetCode", "url": "https://leetcode.com", "type": "Practice"},
                {"name": "GitHub", "url": "https://github.com", "type": "Platform"},
                {"name": "Stack Overflow", "url": "https://stackoverflow.com", "type": "Community"},
                {"name": "Coursera - Programming", "url": "https://coursera.org", "type": "Course"}
            ],
            "full_stack_development": [
                {"name": "FreeCodeCamp", "url": "https://freecodecamp.org", "type": "Course"},
                {"name": "The Odin Project", "url": "https://theodinproject.com", "type": "Course"},
                {"name": "MDN Web Docs", "url": "https://developer.mozilla.org", "type": "Documentation"}
            ],
            "data_science": [
                {"name": "Kaggle", "url": "https://kaggle.com", "type": "Practice"},
                {"name": "Towards Data Science", "url": "https://towardsdatascience.com", "type": "Blog"},
                {"name": "Coursera - Data Science", "url": "https://coursera.org", "type": "Course"}
            ]
        }
    
    def calculate_career_match(self, student_data, career_key, career_info):
        """Calculate match percentage for a career"""
        match_score = 0
        factors = []
        
        # Subject performance match (50% weight)
        academic_records = student_data.get('academicPerformance', [])
        subject_scores = {}
        for record in academic_records:
            if isinstance(record, dict):
                subject = record.get('subject', '').lower()
                score = record.get('score', 0)
                subject_scores[subject] = score
        
        # Check preferred subjects
        preferred_matches = 0
        for subject in career_info['preferred_subjects']:
            subject_lower = subject.lower()
            for student_subject, score in subject_scores.items():
                if subject_lower in student_subject or student_subject in subject_lower:
                    if score >= 80:
                        match_score += 15
                        preferred_matches += 1
                        factors.append(f"Excellent in {subject}")
                    elif score >= 65:
                        match_score += 10
                        preferred_matches += 1
                        factors.append(f"Good in {subject}")
                    elif score >= 50:
                        match_score += 5
                        factors.append(f"Average in {subject}")
        
        # CGPA check (20% weight)
        cgpa = float(student_data.get('cgpa', 0))
        min_cgpa = career_info['min_cgpa']
        
        if cgpa >= min_cgpa + 0.5:
            match_score += 20
            factors.append("Excellent academic record")
        elif cgpa >= min_cgpa + 0.2:
            match_score += 15
            factors.append("Good academic record")
        elif cgpa >= min_cgpa:
            match_score += 10
            factors.append("Meets minimum CGPA requirement")
        
        # Skills alignment (30% weight)
        skills_matched = 0
        for skill in career_info['required_skills']:
            skill_lower = skill.lower()
            for subject, score in subject_scores.items():
                if skill_lower in subject and score >= 60:
                    match_score += 5
                    skills_matched += 1
        
        # Calculate final percentage (max 100)
        final_match = min(match_score, 100)
        
        return {
            "match": final_match,
            "factors": factors[:3],
            "skills_matched": skills_matched,
            "meets_min_cgpa": cgpa >= min_cgpa
        }
    
    def recommend_careers(self, student_data):
        """Generate career recommendations based on student profile"""
        recommendations = []
        
        # Calculate match for each career
        for career_key, career_info in self.career_paths.items():
            match_result = self.calculate_career_match(student_data, career_key, career_info)
            
            if match_result['match'] >= 50:  # Only recommend if match > 50%
                career_rec = {
                    "title": career_info['title'],
                    "match": match_result['match'],
                    "description": f"Match based on your strengths in {', '.join(match_result['factors'][:2])}" if match_result['factors'] else "Good fit based on your profile",
                    "skills": career_info['required_skills'],
                    "min_cgpa": career_info['min_cgpa'],
                    "growth_potential": career_info['growth_potential'],
                    "average_salary": career_info['average_salary'],
                    "demand": career_info['demand'],
                    "factors": match_result['factors'],
                    "resources": self.learning_resources.get(career_key, [])
                }
                recommendations.append(career_rec)
        
        # Sort by match percentage
        recommendations.sort(key=lambda x: x['match'], reverse=True)
        
        # Identify strong and weak subjects
        academic_records = student_data.get('academicPerformance', [])
        strong_subjects = []
        weak_subjects = []
        
        for record in academic_records:
            if isinstance(record, dict):
                subject = record.get('subject', '')
                score = record.get('score', 0)
                if score >= 80:
                    strong_subjects.append(subject)
                elif score < 60:
                    weak_subjects.append(subject)
        
        # Generate skill gap analysis
        skill_gaps = []
        if recommendations:
            top_career = recommendations[0]
            required_skills = set(top_career['skills'])
            
            # Check which skills need development
            for skill in required_skills:
                skill_found = False
                for subject, score in subject_scores.items():
                    if skill.lower() in subject.lower():
                        skill_found = True
                        if score < 70:
                            skill_gaps.append({
                                "skill": skill,
                                "current_level": "Beginner" if score < 50 else "Intermediate" if score < 70 else "Advanced",
                                "recommended_resources": [
                                    {"name": f"Learn {skill}", "url": f"https://www.coursera.org/search?query={skill}"}
                                ]
                            })
                        break
                
                if not skill_found:
                    skill_gaps.append({
                        "skill": skill,
                        "current_level": "Not Started",
                        "recommended_resources": [
                            {"name": f"Start learning {skill}", "url": f"https://www.udemy.com/courses/search/?q={skill}"}
                        ]
                    })
        
        return {
            "topCareers": recommendations[:5],  # Top 5 recommendations
            "strongSubjects": strong_subjects,
            "areasForImprovement": weak_subjects,
            "recommendedPath": recommendations[0] if recommendations else None,
            "skillGaps": skill_gaps[:5],
            "timestamp": str(np.datetime64('now'))
        }

# Singleton instance
career_recommender = CareerRecommender()