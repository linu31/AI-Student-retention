import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const RiskAnalysis = ({ students }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const runFullAnalysis = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/ml/analyze-all');
      setAnalysis(response.data);
      toast.success('Analysis complete');
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Risk Analysis</h2>

      <button
        onClick={runFullAnalysis}
        disabled={loading}
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 mb-6"
      >
        {loading ? 'Analyzing...' : 'Run Full Risk Analysis'}
      </button>

      {analysis && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Analysis Results</h3>
          <p>Total Students Analyzed: {analysis.analyzedCount}</p>
          
          <div className="space-y-2">
            {analysis.results?.map((result, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded">
                <p>{result.name} - Risk Level: {result.riskLevel}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskAnalysis;