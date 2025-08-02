import React, { useState, useEffect } from 'react';
import { CallLog } from '../../types';
import { mockStudents, mockTPOs } from '../../data/mockData';
import { Phone, PhoneCall, Clock, CheckCircle, Calendar, ExternalLink, Plus, Mic, AlertCircle, Database, RefreshCw } from 'lucide-react';
import { VoiceCallInterface } from './VoiceCallInterface';
import { callService } from '../../services/callService';

export const CallManagement: React.FC = () => {
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [voiceCallData, setVoiceCallData] = useState<{
    contactId: string;
    contactType: 'student' | 'tpo';
    contactName: string;
    callType: 'introduction' | 'telephonic_interview' | 'teams_scheduling' | 'tpo_outreach';
  } | null>(null);
  const [dbStatus, setDbStatus] = useState<'connected' | 'error' | 'checking'>('checking');

  useEffect(() => {
    loadCalls();
    checkDatabaseConnection();
  }, []);

  const loadCalls = async () => {
    setLoading(true);
    try {
      const dbCalls = await callService.loadCallsFromDatabase();
      setCalls(dbCalls);
      setDbStatus('connected');
    } catch (error) {
      console.error('Failed to load calls:', error);
      setDbStatus('error');
      // Load mock data as fallback
      setCalls([]);
    } finally {
      setLoading(false);
    }
  };

  const checkDatabaseConnection = async () => {
    setDbStatus('checking');
    try {
      await callService.loadCallsFromDatabase();
      setDbStatus('connected');
    } catch (error) {
      setDbStatus('error');
    }
  };

  const retryFailedSaves = async () => {
    try {
      await callService.retryFailedSaves();
      await loadCalls();
      alert('Successfully retried failed saves!');
    } catch (error) {
      alert('Failed to retry saves. Please check your connection.');
    }
  };

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

  const initiateCall = (contactType: 'student' | 'tpo', contactId: string, callType: any) => {
    const contactName = contactType === 'student' 
      ? mockStudents.find(s => s.id === contactId)?.name || 'Unknown Student'
      : mockTPOs.find(t => t.id === contactId)?.name || 'Unknown TPO';
    
    setVoiceCallData({
      contactId,
      contactType,
      contactName,
      callType
    });
    setActiveCall(contactId);
  };

  const getCallTypeOptions = (contactType: 'student' | 'tpo') => {
    if (contactType === 'tpo') {
      return [
        { value: 'tpo_outreach', label: 'TPO Outreach' }
      ];
    }
    return [
      { value: 'introduction', label: 'Introduction Call' },
      { value: 'telephonic_interview', label: 'Telephonic Interview' },
      { value: 'teams_scheduling', label: 'Teams Scheduling' }
    ];
  };

  return (
    <>
      {voiceCallData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <VoiceCallInterface
            contactId={voiceCallData.contactId}
            contactType={voiceCallData.contactType}
            contactName={voiceCallData.contactName}
            callType={voiceCallData.callType}
            onCallEnd={() => {
              setVoiceCallData(null);
              setActiveCall(null);
              loadCalls(); // Reload calls after ending
            }}
          />
        </div>
      )}
      
      <div className="space-y-6">
        {/* Database Status Banner */}
        <div className={`rounded-lg p-4 ${
          dbStatus === 'connected' ? 'bg-green-50 border border-green-200' :
          dbStatus === 'error' ? 'bg-red-50 border border-red-200' :
          'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className={`w-5 h-5 ${
                dbStatus === 'connected' ? 'text-green-600' :
                dbStatus === 'error' ? 'text-red-600' :
                'text-yellow-600'
              }`} />
              <div>
                <h3 className={`font-medium ${
                  dbStatus === 'connected' ? 'text-green-800' :
                  dbStatus === 'error' ? 'text-red-800' :
                  'text-yellow-800'
                }`}>
                  Database Status: {dbStatus === 'connected' ? 'Connected' : dbStatus === 'error' ? 'Connection Error' : 'Checking...'}
                </h3>
                <p className={`text-sm ${
                  dbStatus === 'connected' ? 'text-green-600' :
                  dbStatus === 'error' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {dbStatus === 'connected' ? 'All calls are being saved successfully' :
                   dbStatus === 'error' ? 'Calls are being saved locally as backup' :
                   'Verifying database connection...'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={checkDatabaseConnection}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                title="Check Connection"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              {dbStatus === 'error' && (
                <button
                  onClick={retryFailedSaves}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Retry Failed Saves
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
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
                  {calls.reduce((acc, call) => acc + (call.duration || 0), 0)}m
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
                  {calls.filter(c => c.jotform_sent).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Jerry Call Management */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Jerry - AI Call Agent</h2>
              <p className="text-purple-100">All calls are initiated and managed by Jerry with professional expertise</p>
            </div>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Jerry Call</span>
            </button>
          </div>
        </div>

        {/* Call Log */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Call Log</h2>
            <button
              onClick={loadCalls}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading calls...</p>
            </div>
          ) : calls.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Calls Yet</h3>
              <p className="text-gray-600 mb-4">Jerry hasn't made any calls yet. Schedule the first call to get started.</p>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Schedule First Call
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {calls.map((call) => (
                <div key={call.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{getCallTypeIcon(call.contact_type)}</div>
                      <div>
                        <h3 className="font-medium text-gray-900">{getContactName(call)}</h3>
                        <p className="text-sm text-gray-600 capitalize">{call.contact_type}</p>
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
                        {call.jotform_sent && (
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
                    {call.completed_at && (
                      <span>Completed: {new Date(call.completed_at).toLocaleString()}</span>
                    )}
                    {call.scheduled_at && !call.completed_at && (
                      <span>Scheduled: {new Date(call.scheduled_at).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule Call Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Schedule Jerry Call</h3>
                <p className="text-sm text-gray-600 mt-1">Jerry will handle the call professionally</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Type</label>
                  <select 
                    id="contactType"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="student">Student</option>
                    <option value="tpo">TPO</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Call Type</label>
                  <select 
                    id="callType"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="introduction">Introduction Call</option>
                    <option value="telephonic_interview">Telephonic Interview</option>
                    <option value="teams_scheduling">Teams Scheduling</option>
                    <option value="tpo_outreach">TPO Outreach</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
                  <select 
                    id="contactId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select contact...</option>
                    {mockStudents.map(student => (
                      <option key={student.id} value={student.id}>{student.name}</option>
                    ))}
                    {mockTPOs.map(tpo => (
                      <option key={tpo.id} value={tpo.id}>{tpo.name}</option>
                    ))}
                  </select>
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
                    const contactType = (document.getElementById('contactType') as HTMLSelectElement).value as 'student' | 'tpo';
                    const contactId = (document.getElementById('contactId') as HTMLSelectElement).value;
                    const callType = (document.getElementById('callType') as HTMLSelectElement).value;
                    
                    if (contactId) {
                      setShowScheduleModal(false);
                      initiateCall(contactType, contactId, callType);
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Start Jerry Call
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};