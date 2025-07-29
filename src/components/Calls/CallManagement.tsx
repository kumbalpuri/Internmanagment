import React, { useState } from 'react';
import { CallLog } from '../../types';
import { mockCallLogs, mockStudents, mockTPOs } from '../../data/mockData';
import { Phone, PhoneCall, Clock, CheckCircle, Calendar, ExternalLink, Plus, Mic } from 'lucide-react';
import { VoiceCallInterface } from './VoiceCallInterface';

export const CallManagement: React.FC = () => {
  const [calls] = useState<CallLog[]>(mockCallLogs);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [voiceCallData, setVoiceCallData] = useState<{
    contactId: string;
    contactType: 'student' | 'tpo';
    contactName: string;
  } | null>(null);

  const getCallTypeIcon = (type: string) => {
    return type === 'student' ? '👨‍🎓' : '👨‍🏫';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: 'bg-green-100 text-green-800',
      missed: 'bg-red-100 text-red-800',
      scheduled: 'bg-blue-100 text-blue-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getContactName = (call: CallLog) => {
    if (call.type === 'student' && call.studentId) {
      const student = mockStudents.find(s => s.id === call.studentId);
      return student?.name || 'Unknown Student';
    } else if (call.type === 'tpo' && call.tpoId) {
      const tpo = mockTPOs.find(t => t.id === call.tpoId);
      return tpo?.name || 'Unknown TPO';
    }
    return 'Unknown Contact';
  };

  const initiateCall = (callId: string) => {
    const call = calls.find(c => c.id === callId);
    if (call) {
      const contactName = getContactName(call);
      const contactId = call.studentId || call.tpoId || '';
      
      setVoiceCallData({
        contactId,
        contactType: call.type,
        contactName
      });
      setActiveCall(callId);
    }
  };

  const sendJotForm = (callId: string) => {
    alert('JotForm link sent successfully!');
  };

  return (
    <>
      {voiceCallData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <VoiceCallInterface
            contactId={voiceCallData.contactId}
            contactType={voiceCallData.contactType}
            contactName={voiceCallData.contactName}
            onCallEnd={() => {
              setVoiceCallData(null);
              setActiveCall(null);
            }}
          />
        </div>
      )}
      
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Calls</p>
              <p className="text-2xl font-bold text-gray-900">
                {calls.filter(c => c.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scheduled Calls</p>
              <p className="text-2xl font-bold text-gray-900">
                {calls.filter(c => c.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Duration</p>
              <p className="text-2xl font-bold text-gray-900">
                {calls.reduce((acc, call) => acc + call.duration, 0)}m
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <ExternalLink className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">JotForms Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {calls.filter(c => c.jotFormSent).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Call Log</h2>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Call</span>
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {calls.map((call) => (
            <div key={call.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getCallTypeIcon(call.type)}</div>
                  <div>
                    <h3 className="font-medium text-gray-900">{getContactName(call)}</h3>
                    <p className="text-sm text-gray-600 capitalize">{call.type}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(call.status)}`}>
                      {call.status}
                    </span>
                    {call.duration > 0 && (
                      <p className="text-sm text-gray-500 mt-1">{call.duration} minutes</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {call.status === 'scheduled' && (
                      <button
                        onClick={() => initiateCall(call.id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                          activeCall === call.id
                            ? 'bg-red-600 text-white'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        disabled={activeCall !== null}
                      >
                        {activeCall === call.id ? (
                          <>
                            <Mic className="w-4 h-4 animate-pulse" />
                            <span>Voice Call Active</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4" />
                            <span>Start Voice Call</span>
                          </>
                        )}
                      </button>
                    )}

                    {call.status === 'completed' && !call.jotFormSent && (
                      <button
                        onClick={() => sendJotForm(call.id)}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Send JotForm</span>
                      </button>
                    )}

                    {call.jotFormSent && (
                      <span className="text-sm text-green-600 font-medium">✓ JotForm Sent</span>
                    )}
                  </div>
                </div>
              </div>

              {call.notes && (
                <div className="mt-3 pl-14">
                  <p className="text-sm text-gray-700">{call.notes}</p>
                </div>
              )}

              <div className="mt-3 pl-14 text-xs text-gray-500">
                {call.status === 'completed' && call.completedAt && (
                  <span>Completed: {new Date(call.completedAt).toLocaleString()}</span>
                )}
                {call.status === 'scheduled' && call.scheduledAt && (
                  <span>Scheduled: {new Date(call.scheduledAt).toLocaleString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Schedule New Call</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="student">Student</option>
                  <option value="tpo">TPO</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select contact...</option>
                  {mockStudents.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Call purpose and agenda..."
                ></textarea>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  alert('Call scheduled successfully!');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Schedule Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};