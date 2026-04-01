import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiUpload, FiFile, FiArrowLeft } from 'react-icons/fi';

const FileUpload = ({ setStudents }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState([]);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    // Preview CSV content
    const reader = new FileReader();
    reader.onload = (event) => {
      const lines = event.target.result.split('\n').slice(0, 5);
      setPreview(lines);
    };
    reader.readAsText(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/students/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success(`Successfully uploaded ${response.data.count} students`);
        setStudents(response.data.students);
        
        // Trigger ML analysis
        const analysisResponse = await axios.post('http://localhost:5000/api/ml/analyze-all');
        if (analysisResponse.data.success) {
          toast.success('AI analysis completed for all students');
        }
        
        // Navigate back to dashboard after successful upload
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <h2 className="text-2xl font-bold mb-6">Upload Student Data</h2>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <FiFile className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Upload CSV file with student data
        </p>
        
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        
        <label
          htmlFor="file-upload"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
        >
          <FiUpload className="mr-2" />
          Select File
        </label>
      </div>

      {file && (
        <div className="mt-6">
          <h3 className="font-medium mb-2">File Preview:</h3>
          <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto max-h-40 overflow-y-auto">
            {preview.map((line, index) => (
              <pre key={index} className="text-xs whitespace-pre-wrap break-words">{line}</pre>
            ))}
          </div>
          
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
          >
            {uploading ? 'Uploading...' : 'Upload and Analyze'}
          </button>
        </div>
      )}

      <div className="mt-6">
        <h3 className="font-medium mb-2">Required CSV Format:</h3>
        <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
          <pre className="text-xs whitespace-pre-wrap break-words">
            studentId,name,email,age,gender,department,semester,cgpa,overallAttendance,subjects_scores,lms_logins,tuition_paid,payment_delays,scholarship
          </pre>
          <pre className="text-xs mt-2 text-gray-600 whitespace-pre-wrap break-words">
            Example: S001,John Smith,john.smith@email.com,20,Male,Computer Science,3,3.2,65,"Programming:75,Mathematics:68,Database:82",3,true,0,false
          </pre>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800 font-medium mb-1">📋 Notes:</p>
            <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
              <li>subjects_scores format: "Subject1:Score,Subject2:Score" (use quotes)</li>
              <li>cgpa: numeric value (0-4 scale)</li>
              <li>overallAttendance: percentage (0-100)</li>
              <li>tuition_paid: true/false</li>
              <li>payment_delays: number of delays</li>
              <li>scholarship: true/false</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;