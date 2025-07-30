import React, { useState, useEffect } from 'react';
import { JotFormResponse } from '../../types';
import { ExternalLink, Download, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const JotFormIntegration: React.FC = () => {
  const [responses, setResponses] = useState<JotFormResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState('all');

  // Mock JotForm responses
  const mockResponses: JotFormResponse[] = [
    {
      id: '1',
      jobId: '1',
      studentData: {
        name: 'Arjun Patel',
        email: 'arjun.patel@email.com',
        phone: '+91-9876543214',
        college: 'IIT Bombay',
        course: 'Computer Science Engineering',
        year: 3,
        cgpa: 8.9,
        skills: ['React', 'Node.js', 'Python', 'AWS'],
        experience: 'Built 2 full-stack applications, internship at startup',
        resume: 'arjun_patel_resume.pdf'
      },
      submittedAt: '2024-01-28T10:30:00Z',
      screened: true,
      shortlisted: true,
      rating: 8.5,
      evaluationNotes: 'Strong technical background, good project experience'
    },
    {
      id: '2',
      jobId: '1',
      studentData: {
        name: 'Kavya Sharma',
        email: 'kavya.sharma@email.com',
        phone: '+91-9876543215',
        college: 'NIT Warangal',
        course: 'Information Technology',
        year: 4,
        cgpa: 9.2,
        skills: ['Java', 'Spring Boot', 'React', 'MySQL'],
        experience: 'Multiple projects, hackathon winner',
        resume: 'kavya_sharma_resume.pdf'
      },
      submittedAt: '2024-01-28T11:15:00Z',
      screened: true,
      shortlisted: false,
      rating: 6.5,
      evaluationNotes: 'Good academic record but limited relevant experience'
    }
  ];

  useEffect(() => {
    setResponses(mockResponses);
  }, []);

  const fetchJotFormData = async () => {
    setLoading(true);
    try {
      // Simulate API call to JotForm
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would be:
      // const response = await fetch('https://api.jotform.com/form/{formId}/submissions', {
      //   headers: { 'APIKEY': 'your-api-key' }
      // });
      // const data = await response.json();
      
      setResponses(mockResponses);
    } catch (error) {
      console.error('Error fetching JotForm data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (response: JotFormResponse) => {
    if (!response.screened) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Pending Review</span>;
    }
    if (response.shortlisted) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Shortlisted</span>;
    }
    return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Not Selected</span>;
  };

  const getStatusIcon = (response: JotFormResponse) => {
    if (!response.screened) {
      return <Clock className="w-4 h-4 text-gray-500" />;
    }
    if (response.shortlisted) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">JotForm Integration</h1>
            <p className="text-gray-600">Manage student applications received via JotForm</p>
          </div>
          <button
            onClick={fetchJotFormData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <ExternalLink className="w-4 h-4" />
            <span>{loading ? 'Syncing...' : 'Sync JotForm Data'}</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <ExternalLink className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{responses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {responses.filter(r => !r.screened).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Shortlisted</p>
              <p className="text-2xl font-bold text-gray-900">
                {responses.filter(r => r.shortlisted).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <AlertCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {responses.filter(r => r.rating).length > 0 
                  ? (responses.filter(r => r.rating).reduce((acc, r) => acc + (r.rating || 0), 0) / responses.filter(r => r.rating).length).toFixed(1)
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Student Applications</h2>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Positions</option>
              <option value="1">Full Stack Developer</option>
              <option value="2">Data Science Intern</option>
              <option value="3">Mobile App Developer</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {responses.map((response) => (
            <div key={response.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(response)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">{response.studentData.name}</h3>
                      {getStatusBadge(response)}
                      {response.rating && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          Rating: {response.rating}/10
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Email:</span> {response.studentData.email}
                      </div>
                      <div>
                        <span className="font-medium">College:</span> {response.studentData.college}
                      </div>
                      <div>
                        <span className="font-medium">Course:</span> {response.studentData.course}
                      </div>
                      <div>
                        <span className="font-medium">CGPA:</span> {response.studentData.cgpa}
                      </div>
                    </div>

                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-700">Skills: </span>
                      <div className="inline-flex flex-wrap gap-1 mt-1">
                        {response.studentData.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {response.evaluationNotes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <span className="text-sm font-medium text-blue-800">Jerry's Evaluation: </span>
                        <span className="text-sm text-blue-700">{response.evaluationNotes}</span>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Submitted: {new Date(response.submittedAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    title="Download Resume"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {responses.length === 0 && (
          <div className="text-center py-12">
            <ExternalLink className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-600 mb-4">Student applications will appear here once they submit the JotForm</p>
            <button
              onClick={fetchJotFormData}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sync JotForm Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};