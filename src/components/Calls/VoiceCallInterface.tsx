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
  AlertCircle
} from 'lucide-react';

interface VoiceCallInterfaceProps {
  contactId: string;
  contactType: 'student' | 'tpo';
  contactName: string;
  onCallEnd: () => void;
}

export const VoiceCallInterface: React.FC<VoiceCallInterfaceProps> = ({
  contactId,
  contactType,
  contactName,
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

  // Initialize call
  useEffect(() => {
    const initializeCall = async () => {
      try {
        setIsInitializing(true);
        const newSessionId = await callService.initiateCall(contactType, contactName, contactId);
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
  }, [contactId, contactType, contactName]);

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
      await callService.endCall(sessionId, 'Call ended by user');
      setIsCallActive(false);
      onCallEnd();
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isInitializing) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-4xl mx-auto p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Initializing Call...</h3>
          <p className="text-gray-600">Setting up voice connection with {contactName}</p>
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{contactName}</h2>
            <p className="text-blue-100 capitalize">{contactType} Call</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-lg font-mono">
              <Clock className="w-5 h-5" />
              <span>{formatDuration(callDuration)}</span>
            </div>
            <div className={`text-sm ${isCallActive ? 'text-green-200' : 'text-red-200'}`}>
              {isCallActive ? 'Call Active' : 'Call Ended'}
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
            <span>{isSpeaking ? 'Stop Speaking' : 'Not Speaking'}</span>
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
            <span className="text-sm font-medium">Text-to-Speech</span>
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
            <Brain className="w-3 h-3 text-purple-600" />
            <span className="text-xs text-purple-600 font-medium">AI Powered</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto border">
          {!session?.transcript || session.transcript.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">
                Jerry is ready to assist with any questions about students, jobs, and intern management.
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
                    entry.speaker === 'agent'
                      ? 'bg-blue-50 border-l-4 border-blue-400'
                      : entry.type === 'action'
                      ? 'bg-yellow-50 border-l-4 border-yellow-400'
                      : 'bg-green-50 border-l-4 border-green-400'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {entry.speaker === 'agent' ? (
                      <User className="w-4 h-4 text-blue-600" />
                    ) : entry.type === 'action' ? (
                      <Zap className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <Bot className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium text-gray-600">
                        {entry.speaker === 'agent' ? 'You' : entry.type === 'action' ? 'Action' : 'Jerry'}
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

      {/* Quick Actions Guide */}
      <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 rounded-b-xl">
        <div className="flex items-center space-x-2 mb-3">
          <Brain className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-gray-700">AI-Powered Voice Commands:</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="bg-white p-2 rounded border border-purple-200">
            <strong className="text-purple-700">"Send form"</strong>
            <div className="text-gray-600">Send JotForm</div>
          </div>
          <div className="bg-white p-2 rounded border border-purple-200">
            <strong className="text-purple-700">"Schedule meeting"</strong>
            <div className="text-gray-600">Book appointment</div>
          </div>
          <div className="bg-white p-2 rounded border border-purple-200">
            <strong className="text-purple-700">"Student profile"</strong>
            <div className="text-gray-600">Get student info</div>
          </div>
          <div className="bg-white p-2 rounded border border-purple-200">
            <strong className="text-purple-700">"Job requirements"</strong>
            <div className="text-gray-600">Get job details</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-purple-700 bg-white p-3 rounded border border-purple-200">
          <strong>💡 Natural Conversation:</strong> You can speak naturally! Ask questions like "What internships are available?", "Tell me about student applications", or any other query - Jerry will understand and respond intelligently using Gemini 2.0 Flash.
        </div>
      </div>
    </div>
  );
};