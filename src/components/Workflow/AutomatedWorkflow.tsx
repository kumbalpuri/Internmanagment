import React, { useState } from 'react';
import { WorkflowStep, College, InterviewPanel } from '../../types';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Users, 
  Phone, 
  Mail, 
  Calendar,
  Bot,
  Brain,
  Zap
} from 'lucide-react';

export const AutomatedWorkflow: React.FC = () => {
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const mockColleges: College[] = [
    {
      id: '1',
      name: 'IIT Delhi',
      location: 'New Delhi',
      tpoContact: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@iitdelhi.ac.in',
      phone: '+91-9876543220',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'BITS Pilani',
      location: 'Pilani, Rajasthan',
      tpoContact: 'Prof. Sunita Agarwal',
      email: 'sunita.agarwal@bitspilani.ac.in',
      phone: '+91-9876543221',
      createdAt: '2024-01-02T00:00:00Z'
    }
  ];

  const startAutomatedWorkflow = async (jobId: string, colleges: string[]) => {
    setActiveWorkflow(jobId);
    
    // Initialize workflow steps
    const steps: WorkflowStep[] = [
      {
        id: '1',
        jobId,
        step: 'tpo_contact',
        status: 'in_progress',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        jobId,
        step: 'jotform_sent',
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        jobId,
        step: 'applications_received',
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        id: '4',
        jobId,
        step: 'resume_screening',
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        id: '5',
        jobId,
        step: 'shortlist_created',
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        id: '6',
        jobId,
        step: 'interviews_scheduled',
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        id: '7',
        jobId,
        step: 'interviews_completed',
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        id: '8',
        jobId,
        step: 'offers_sent',
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    ];

    setWorkflowSteps(steps);

    // Simulate Jerry starting TPO contacts
    setTimeout(() => {
      updateStepStatus('1', 'completed', 'Jerry successfully contacted all TPOs');
      updateStepStatus('2', 'in_progress');
    }, 3000);

    setTimeout(() => {
      updateStepStatus('2', 'completed', 'JotForm links sent to all TPOs');
      updateStepStatus('3', 'in_progress');
    }, 6000);
  };

  const updateStepStatus = (stepId: string, status: WorkflowStep['status'], notes?: string) => {
    setWorkflowSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { 
            ...step, 
            status, 
            notes,
            completedAt: status === 'completed' ? new Date().toISOString() : undefined
          }
        : step
    ));
  };

  const getStepIcon = (step: WorkflowStep) => {
    if (step.status === 'completed') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (step.status === 'in_progress') return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
    if (step.status === 'failed') return <AlertCircle className="w-5 h-5 text-red-600" />;
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  const getStepTitle = (stepType: WorkflowStep['step']) => {
    const titles = {
      'tpo_contact': 'TPO Contact',
      'jotform_sent': 'JotForm Distribution',
      'applications_received': 'Applications Collection',
      'resume_screening': 'Resume Screening',
      'shortlist_created': 'Shortlist Creation',
      'interviews_scheduled': 'Interview Scheduling',
      'interviews_completed': 'Interview Completion',
      'offers_sent': 'Offer Distribution'
    };
    return titles[stepType];
  };

  const getStepDescription = (stepType: WorkflowStep['step']) => {
    const descriptions = {
      'tpo_contact': 'Jerry contacts TPOs to discuss job openings',
      'jotform_sent': 'JotForm links sent to TPOs for student applications',
      'applications_received': 'Collecting student applications via JotForm',
      'resume_screening': 'Jerry evaluates resumes against job requirements',
      'shortlist_created': 'Qualified candidates shortlisted with reasons',
      'interviews_scheduled': 'Teams meetings scheduled with interview panels',
      'interviews_completed': 'Telephonic and Teams interviews conducted',
      'offers_sent': 'Job offers sent to selected candidates'
    };
    return descriptions[stepType];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Bot className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Jerry - Automated Workflow</h1>
            <p className="text-purple-100">AI-powered intern management automation</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5" />
              <span className="font-medium">Gemini 2.0 Flash</span>
            </div>
            <p className="text-sm text-purple-100 mt-1">Advanced AI processing</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span className="font-medium">Full Automation</span>
            </div>
            <p className="text-sm text-purple-100 mt-1">End-to-end workflow</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span className="font-medium">Multi-College</span>
            </div>
            <p className="text-sm text-purple-100 mt-1">Scalable outreach</p>
          </div>
        </div>
      </div>

      {/* Workflow Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Workflow Management</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>Start New Workflow</span>
          </button>
        </div>

        {/* Active Workflow */}
        {activeWorkflow && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Bot className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">Jerry is processing workflow for Job ID: {activeWorkflow}</span>
            </div>

            {workflowSteps.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getStepIcon(step)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">{getStepTitle(step.step)}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      step.status === 'completed' ? 'bg-green-100 text-green-800' :
                      step.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      step.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {step.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{getStepDescription(step.step)}</p>
                  {step.notes && (
                    <p className="text-sm text-green-600 mt-2 font-medium">{step.notes}</p>
                  )}
                  {step.completedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Completed: {new Date(step.completedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Step {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        {!activeWorkflow && (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Workflow</h3>
            <p className="text-gray-600 mb-4">Start a new automated workflow to begin the intern management process</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Workflow
            </button>
          </div>
        )}
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Create Automated Workflow</h3>
              <p className="text-gray-600 mt-1">Jerry will handle the complete process automatically</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Position</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Full Stack Developer Intern"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Requirements</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="List the key requirements for this position..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Colleges</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {mockColleges.map(college => (
                    <label key={college.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <input type="checkbox" className="rounded" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{college.name}</div>
                        <div className="text-sm text-gray-600">{college.tpoContact} - {college.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interview Panel</label>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Panelist Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="email"
                    placeholder="Panelist Email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="Role/Designation"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-800 mb-2 flex items-center">
                  <Bot className="w-4 h-4 mr-2" />
                  Jerry's Automated Process:
                </h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Contact TPOs and discuss job requirements</li>
                  <li>• Send JotForm links for student applications</li>
                  <li>• Screen resumes using AI evaluation</li>
                  <li>• Conduct telephonic interviews</li>
                  <li>• Schedule Teams meetings with panels</li>
                  <li>• Send offers to selected candidates</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  startAutomatedWorkflow('job_001', ['1', '2']);
                }}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Start Workflow</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};