import React, { useState, useEffect } from 'react';
import { CallSession, CallTranscript, callService } from '../../services/callService';
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
  Zap
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
  const [session, setSession] = useState<CallSession | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  // Initialize call
  useEffect(() => {
    const initializeCall = async () => {
      try {
        const newSession = await callService.initiateCall(contactId, contactType);
        setSession(newSession);
        setIsCallActive(true);
        setError(null);
      } catch (err) {
        setError('Failed to initialize call');
        console.error('Call initialization error:', err);
      }
    };

    initializeCall();
  }, [contactId, contactType]);

  // Update call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isCallActive && session) {
      interval = setInterval(() => {
        const duration = Math.floor((new Date().getTime() - session.startTime.getTime()) / 1000);
        setCallDuration(duration);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCallActive, session]);

  // Monitor speech service states
  useEffect(() => {
    const checkStates = () => {
      setIsListening(speechService.isCurrentlyListening());
      setIsSpeaking(speechService.isCurrentlySpeaking());
      
      // Check if AI is processing by looking at recent transcript entries
      if (session) {
        const recentEntries = session.transcript.slice(-3);
        const isProcessing = recentEntries.some(entry => 
          entry.text.includes('Processing with Gemini AI') || 
          entry.text.includes('AI is thinking')
        );
        setIsProcessingAI(isProcessing);
      }
    };

    const interval = setInterval(checkStates, 100);
    return () => clearInterval(interval);
  }, []);

  const startVoiceInteraction = async () => {
    if (!session) return;

    try {
      await callService.startVoiceInteraction(session.id);
      setError(null);
    } catch (err) {
      setError('Failed to start voice recognition');
      console.error('Voice interaction error:', err);
    }
  };

  const stopVoiceInteraction = () => {
    callService.stopVoiceRecognition();
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      callService.stopSpeaking();
    }
  };

  const endCall = async () => {
    if (session) {
      await callService.endCall(session.id);
      setIsCallActive(false);
      onCallEnd();
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTranscriptIcon = (entry: CallTranscript) => {
    if (entry.speaker === 'agent') {
      return <User className="w-4 h-4 text-blue-600" />;
    } else {
      return <Bot className="w-4 h-4 text-green-600" />;
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={onCallEnd}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Close
        </button>
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
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={isListening ? stopVoiceInteraction : startVoiceInteraction}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              isListening
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
            disabled={!isCallActive}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span>{isListening ? 'Stop Listening' : 'Start Voice Recognition'}</span>
          </button>

          <button
            onClick={toggleSpeaking}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              isSpeaking
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
            disabled={!isSpeaking}
          >
            {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            <span>{isSpeaking ? 'Stop Speaking' : 'Not Speaking'}</span>
          </button>

          <button
            onClick={endCall}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <PhoneOff className="w-5 h-5" />
            <span>End Call</span>
          </button>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
          <div className={`flex items-center space-x-2 ${isListening ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span>Voice Recognition</span>
          </div>
          <div className={`flex items-center space-x-2 ${isSpeaking ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span>Text-to-Speech</span>
          </div>
          <div className={`flex items-center space-x-2 ${isProcessingAI ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full ${isProcessingAI ? 'bg-purple-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span>Gemini 2.5 Flash</span>
          </div>
        </div>
      </div>

      {/* Live Transcript */}
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Gemini 2.5 Flash Live Transcript</h3>
            <div className="flex items-center space-x-1 px-2 py-1 bg-purple-100 rounded-full">
              <Brain className="w-3 h-3 text-purple-600" />
              <span className="text-xs text-purple-600 font-medium">Gemini 2.5 Flash</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
          {session?.transcript.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Gemini 2.5 Flash powered conversation transcript will appear here. The advanced LLM will provide intelligent, context-aware responses to any query about students, jobs, and intern management.
            </p>
          ) : (
            <div className="space-y-3">
              {session?.transcript.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg ${
                    entry.speaker === 'agent'
                      ? 'bg-blue-50 border-l-4 border-blue-400'
                      : entry.type === 'action'
                      ? 'bg-yellow-50 border-l-4 border-yellow-400'
                      : 'bg-purple-50 border-l-4 border-purple-400'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {entry.speaker === 'agent' ? (
                      <User className="w-4 h-4 text-blue-600" />
                    ) : entry.type === 'action' ? (
                      <Zap className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <div className="relative">
                        <Brain className="w-4 h-4 text-purple-600" />
                        {isProcessingAI && entry === session?.transcript[session.transcript.length - 1] && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {entry.speaker === 'agent' ? 'Agent' : entry.type === 'action' ? 'System Action' : 'Gemini 2.5 Flash'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {entry.timestamp.toLocaleTimeString()}
                      </span>
                      {entry.type === 'action' && (
                        <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                          Action
                        </span>
                      )}
                      {entry.speaker === 'system' && entry.type === 'speech' && (
                        <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                          Gemini Response
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm">{entry.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current transcript preview */}
        {currentTranscript && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-600 font-medium mb-1">Currently speaking:</div>
            <div className="text-gray-700">{currentTranscript}</div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <div className="flex items-center space-x-2 mb-3">
          <Brain className="w-4 h-4 text-purple-600" />
          <span className="text-sm text-gray-600">AI-Powered Voice Commands:</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="bg-white p-2 rounded border">
            <strong>"Send form"</strong> - Send JotForm
          </div>
          <div className="bg-white p-2 rounded border">
            <strong>"Schedule meeting"</strong> - Book appointment
          </div>
          <div className="bg-white p-2 rounded border">
            <strong>"Student profile"</strong> - Get student info
          </div>
          <div className="bg-white p-2 rounded border">
            <strong>"End call"</strong> - Terminate session
          </div>
          <div className="bg-purple-50 p-2 rounded border border-purple-200">
            <strong>"Job requirements"</strong> - Get job details
          </div>
          <div className="bg-purple-50 p-2 rounded border border-purple-200">
            <strong>"Application status"</strong> - Check progress
          </div>
          <div className="bg-purple-50 p-2 rounded border border-purple-200">
            <strong>"Available positions"</strong> - List jobs
          </div>
          <div className="bg-purple-50 p-2 rounded border border-purple-200">
            <strong>Natural conversation</strong> - Ask anything!
          </div>
        </div>
        <div className="mt-2 text-xs text-purple-600 bg-purple-50 p-2 rounded border border-purple-200">
          💡 <strong>Powered by Gemini 2.5 Flash:</strong> You can speak naturally about anything! Ask questions like "Tell me about available internships", "What are the requirements for the developer position?", or any other query - the AI will understand and respond intelligently.
        </div>
      </div>
    </div>
  );
};