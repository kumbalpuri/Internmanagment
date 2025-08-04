import React, { useState, useEffect } from 'react';
import { CallSession, callService } from '../../services/callService';
import { speechService } from '../../services/speechService';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageSquare,
  Clock,
  User,
  Bot,
  Brain,
  Zap,
  AlertCircle,
  CheckCircle,
  Award
} from 'lucide-react';

interface VoiceCallInterfaceProps {
  contactId: string;
  contactType: 'student' | 'tpo';
  contactName: string;
  callType: 'introduction' | 'telephonic_interview' | 'teams_scheduling' | 'tpo_outreach';
  resumeId?: string;
  jobDescriptionId?: string;
  onCallEnd: () => void;
}

export const VoiceCallInterface: React.FC<VoiceCallInterfaceProps> = ({
  contactId,
  contactType,
  contactName,
  callType,
  resumeId,
  jobDescriptionId,
  onCallEnd
}) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<CallSession | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error'>('saved');

  // Initialize call
  useEffect(() => {
    const initializeCall = async () => {
      try {
        setIsInitializing(true);
        const newSessionId = await callService.initiateCall(
          contactType, 
          contactName, 
          contactId, 
          undefined, // phone
          undefined, // email
          callType,
          resumeId,
          jobDescriptionId
        );
        setSessionId(newSessionId);
        setIsCallActive(true);
        setError(null);
      } catch (err) {
        setError('Failed to initialize call. Please check your microphone permissions.');
        console.error('Call initialization error:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeCall();

    // Cleanup on unmount
    return () => {
      if (sessionId) {
        callService.endCall(sessionId);
      }
    };
  }, [contactId, contactType, contactName, callType, resumeId, jobDescriptionId]);

  // Update session data and call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isCallActive && sessionId) {
      interval = setInterval(() => {
        const currentSession = callService.getActiveSession(sessionId);
        if (currentSession) {
          setSession({ ...currentSession });
          const duration = Math.floor((new Date().getTime() - currentSession.startTime.getTime()) / 1000);
          setCallDuration(duration);
          
          // Auto-save every 30 seconds
          if (duration % 30 === 0 && duration > 0) {
            setSaveStatus('saving');
            // The callService automatically saves during processVoiceCommand
            setTimeout(() => setSaveStatus('saved'), 1000);
          }
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCallActive, sessionId]);

  // Monitor speech service states
  useEffect(() => {
    const checkStates = () => {
      setIsListening(speechService.isCurrentlyListening());
      setIsSpeaking(speechService.isCurrentlySpeaking());
    };

    const interval = setInterval(checkStates, 500);
    return () => clearInterval(interval);
  }, []);

  const startVoiceInteraction = async () => {
    if (!sessionId) return;

    try {
      await callService.startVoiceInteraction(sessionId);
      setError(null);
    } catch (err) {
      setError('Failed to start voice recognition. Please check your microphone permissions.');
      console.error('Voice interaction error:', err);
    }
  };

  const stopVoiceInteraction = () => {
    if (sessionId) {
      callService.stopVoiceRecognition();
    }
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      callService.stopSpeaking();
    }
  };

  const endCall = async () => {
    if (sessionId) {
      setSaveStatus('saving');
      try {
        await callService.endCall(sessionId, 'Call ended by user');
        setSaveStatus('saved');
        setIsCallActive(false);
        onCallEnd();
      } catch (error) {
        setSaveStatus('error');
        console.error('Error ending call:', error);
        // Still end the call in UI
        setIsCallActive(false);
        onCallEnd();
      }
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallTypeTitle = () => {
    const titles = {
      introduction: 'Introduction Call',
      telephonic_interview: 'Telephonic Interview',
      teams_scheduling: 'Teams Scheduling',
      tpo_outreach: 'TPO Outreach'
    };
    return titles[callType];
  };

  const getCallTypeDescription = () => {
    const descriptions = {
      introduction: 'Jerry is introducing the internship opportunity tailored to your profile',
      telephonic_interview: 'Jerry is conducting a resume-based telephonic interview with tailored questions',
      teams_scheduling: 'Jerry is scheduling the Microsoft Teams interview',
      tpo_outreach: 'Jerry is discussing internship opportunities with TPO'
    };
    return descriptions[callType];
  };

  if (isInitializing) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-4xl mx-auto p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Jerry is Initializing Call...</h3>
          <p className="text-gray-600">Setting up {getCallTypeTitle().toLowerCase()} with {contactName}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-4xl mx-auto p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Call Error</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Please ensure:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Microphone permissions are granted</li>
              <li>• You're using a supported browser (Chrome, Edge, Safari)</li>
              <li>• Your internet connection is stable</li>
            </ul>
          </div>
          <button
            onClick={onCallEnd}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-4xl mx-auto">
      {/* Call Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{contactName}</h2>
            <p className="text-purple-100">{getCallTypeTitle()}</p>
            <p className="text-sm text-purple-200 mt-1">{getCallTypeDescription()}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-lg font-mono mb-2">
              <Clock className="w-5 h-5" />
              <span>{formatDuration(callDuration)}</span>
            </div>
            <div className={`text-sm flex items-center space-x-2 ${isCallActive ? 'text-green-200' : 'text-red-200'}`}>
              <div className={`w-2 h-2 rounded-full ${isCallActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span>{isCallActive ? 'Call Active' : 'Call Ended'}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-purple-200 mt-1">
              {saveStatus === 'saving' && (
                <>
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <CheckCircle className="w-3 h-3" />
                  <span>Saved</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <AlertCircle className="w-3 h-3" />
                  <span>Save Error</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Call Controls */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={isListening ? stopVoiceInteraction : startVoiceInteraction}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all shadow-md ${
              isListening
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-200'
                : 'bg-green-600 text-white hover:bg-green-700 shadow-green-200'
            }`}
            disabled={!isCallActive}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span>{isListening ? 'Stop Listening' : 'Start Voice Recognition'}</span>
          </button>

          <button
            onClick={toggleSpeaking}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all shadow-md ${
              isSpeaking
                ? 'bg-yellow-600 text-white hover:bg-yellow-700 shadow-yellow-200'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
            disabled={!isSpeaking}
          >
            {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            <span>{isSpeaking ? 'Stop Jerry' : 'Jerry Not Speaking'}</span>
          </button>

          <button
            onClick={endCall}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md shadow-red-200"
          >
            <PhoneOff className="w-5 h-5" />
            <span>End Call</span>
          </button>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-center space-x-8 mt-6">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-full ${isListening ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium">Voice Recognition</span>
          </div>
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-full ${isSpeaking ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
            <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium">Jerry Speaking</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-2 rounded-full bg-purple-100 text-purple-700">
            <Brain className="w-3 h-3" />
            <span className="text-sm font-medium">Gemini 2.0 Flash</span>
          </div>
        </div>
      </div>

      {/* Live Transcript */}
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <MessageSquare className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Live Conversation</h3>
          <div className="flex items-center space-x-1 px-2 py-1 bg-purple-100 rounded-full">
            <Bot className="w-3 h-3 text-purple-600" />
            <span className="text-xs text-purple-600 font-medium">Jerry AI</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto border">
          {!session?.transcript || session.transcript.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">
                Jerry is ready to conduct the {getCallTypeTitle().toLowerCase()}.
              </p>
              <p className="text-sm text-gray-400">
                Click "Start Voice Recognition" to begin the conversation.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {session.transcript.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg transition-all ${
                    entry.speaker === 'contact'
                      ? 'bg-blue-50 border-l-4 border-blue-400'
                      : entry.type === 'action'
                      ? 'bg-yellow-50 border-l-4 border-yellow-400'
                      : entry.type === 'evaluation'
                      ? 'bg-green-50 border-l-4 border-green-400'
                      : 'bg-purple-50 border-l-4 border-purple-400'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {entry.speaker === 'contact' ? (
                      <User className="w-4 h-4 text-blue-600" />
                    ) : entry.type === 'action' ? (
                      <Zap className="w-4 h-4 text-yellow-600" />
                    ) : entry.type === 'evaluation' ? (
                      <Award className="w-4 h-4 text-green-600" />
                    ) : (
                      <Bot className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium text-gray-600">
                        {entry.speaker === 'contact' ? contactName : 
                         entry.type === 'action' ? 'Jerry Action' : 
                         entry.type === 'evaluation' ? 'Jerry Evaluation' : 'Jerry'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {entry.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{entry.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Call Type Specific Guide */}
      <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 rounded-b-xl">
        <div className="flex items-center space-x-2 mb-3">
          <Brain className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-gray-700">Jerry's {getCallTypeTitle()} Process:</span>
        </div>
        
        {contactType === 'tpo' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3 rounded border border-purple-200">
              <strong className="text-purple-700">Professional Introduction</strong>
              <div className="text-gray-600">Introduce Solar Industries India Ltd</div>
            </div>
            <div className="bg-white p-3 rounded border border-purple-200">
              <strong className="text-purple-700">JotForm Distribution</strong>
              <div className="text-gray-600">Request to share with students</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            {callType === 'introduction' && (
              <>
                <div className="bg-white p-2 rounded border border-purple-200">
                  <strong className="text-purple-700">Opportunity Introduction</strong>
                  <div className="text-gray-600">Tailored to student's profile</div>
                </div>
                <div className="bg-white p-2 rounded border border-purple-200">
                  <strong className="text-purple-700">Q&A Session</strong>
                  <div className="text-gray-600">Address questions & concerns</div>
                </div>
                <div className="bg-white p-2 rounded border border-purple-200">
                  <strong className="text-purple-700">Next Steps</strong>
                  <div className="text-gray-600">Guide through application</div>
                </div>
              </>
            )}
            {callType === 'telephonic_interview' && (
              <>
                <div className="bg-white p-2 rounded border border-purple-200">
                  <strong className="text-purple-700">Resume-based Questions</strong>
                  <div className="text-gray-600">Questions based on uploaded resume</div>
                </div>
                <div className="bg-white p-2 rounded border border-purple-200">
                  <strong className="text-purple-700">Job-Specific Questions</strong>
                  <div className="text-gray-600">Aligned with job requirements</div>
                </div>
                <div className="bg-white p-2 rounded border border-purple-200">
                  <strong className="text-purple-700">SWOT & Scoring</strong>
                  <div className="text-gray-600">Professional evaluation & feedback</div>
                </div>
              </>
            )}
            {callType === 'teams_scheduling' && (
              <>
                <div className="bg-white p-2 rounded border border-purple-200">
                  <strong className="text-purple-700">Congratulations</strong>
                  <div className="text-gray-600">Acknowledge success</div>
                </div>
                <div className="bg-white p-2 rounded border border-purple-200">
                  <strong className="text-purple-700">Schedule Coordination</strong>
                  <div className="text-gray-600">Find suitable time slots</div>
                </div>
                <div className="bg-white p-2 rounded border border-purple-200">
                  <strong className="text-purple-700">Meeting Setup</strong>
                  <div className="text-gray-600">Teams invite & preparation</div>
                </div>
              </>
            )}
          </div>
        )}
        
        <div className="mt-3 text-xs text-purple-700 bg-white p-3 rounded border border-purple-200">
          <strong>💡 Resume-Based Intelligence:</strong> Jerry has analyzed the uploaded resume and job description 
          to create tailored interview questions. The conversation adapts based on the candidate's responses, 
          ensuring a comprehensive evaluation. All interactions are automatically saved for record-keeping.
        </div>
      </div>
    </div>
  );
};