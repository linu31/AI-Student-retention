const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const Student = require('../models/Student');
const studentController = require('../controllers/studentController');

const upload = multer({ dest: 'uploads/' });

// Get all students
router.get('/', studentController.getAllStudents);

// Get single student
router.get('/:id', studentController.getStudent);

// Upload CSV
router.post('/upload', upload.single('file'), studentController.uploadStudents);

// Get risk statistics
router.get('/stats/risk', studentController.getRiskStats);

// Update student
router.put('/:id', studentController.updateStudent);

// Delete student
router.delete('/:id', studentController.deleteStudent);

module.exports = router;