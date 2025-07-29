import React, { useState } from 'react';
import { Offer } from '../../types';
import { mockOffers, mockStudents, mockJobDescriptions } from '../../data/mockData';
import { Award, Clock, CheckCircle, XCircle, Send, Eye, Plus } from 'lucide-react';

export const OfferManagement: React.FC = () => {
  const [offers] = useState<Offer[]>(mockOffers);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getStudentName = (studentId: string) => {
    const student = mockStudents.find(s => s.id === studentId);
    return student?.name || 'Unknown Student';
  };

  const getJobTitle = (jobId: string) => {
    const job = mockJobDescriptions.find(j => j.id === jobId);
    return job?.title || 'Unknown Position';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      accepted: CheckCircle,
      rejected: XCircle,
      withdrawn: XCircle,
    };
    return icons[status as keyof typeof icons] || Clock;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {offers.filter(o => o.status === 'pending').length}
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
              <p className="text-sm font-medium text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-gray-900">
                {offers.filter(o => o.status === 'accepted').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {offers.filter(o => o.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Offers</p>
              <p className="text-2xl font-bold text-gray-900">{offers.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Offers</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Offer</span>
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {offers.map((offer) => {
            const StatusIcon = getStatusIcon(offer.status);
            
            return (
              <div key={offer.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <StatusIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {getStudentName(offer.studentId)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Position: {getJobTitle(offer.jobId)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(offer.status)}`}>
                        {offer.status}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">₹{offer.stipend.toLocaleString()}/month</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View Offer Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {offer.status === 'pending' && (
                        <button
                          className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          title="Resend Offer"
                        >
                          <Send className="w-4 h-4" />
                          <span>Resend</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pl-14 space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Start Date:</span> {new Date(offer.startDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {offer.duration}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Sent:</span> {new Date(offer.sentAt).toLocaleString()}
                    {offer.respondedAt && (
                      <span className="ml-4">
                        <span className="font-medium">Responded:</span> {new Date(offer.respondedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create New Offer</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select student...</option>
                  {mockStudents.filter(s => s.status === 'selected').map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Position</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select position...</option>
                  {mockJobDescriptions.map(job => (
                    <option key={job.id} value={job.id}>{job.title} - {job.company}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stipend (₹/month)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="25000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="3 months">3 months</option>
                  <option value="4 months">4 months</option>
                  <option value="5 months">5 months</option>
                  <option value="6 months">6 months</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Standard internship terms and conditions apply..."
                ></textarea>
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
                  alert('Offer created and sent successfully!');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create & Send Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};