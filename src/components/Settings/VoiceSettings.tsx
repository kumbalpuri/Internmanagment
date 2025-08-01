import React, { useState, useEffect } from 'react';
import { speechService } from '../../services/speechService';
import { geminiService } from '../../services/geminiService';
import { Volume2, Mic, Settings, Play, Square, Brain, Zap, CheckCircle, AlertCircle } from 'lucide-react';

export const VoiceSettings: React.FC = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [speechRate, setSpeechRate] = useState(0.9);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [speechVolume, setSpeechVolume] = useState(0.8);
  const [testText, setTestText] = useState('Hello, this is Jerry from Solar Industries India Ltd. I am ready to assist you with intern management.');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-2.0-flash-exp');
  const [geminiTemperature, setGeminiTemperature] = useState(0.7);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  // Initialize with the provided API key
  useEffect(() => {
    setGeminiApiKey('AIzaSyB6F_bQ2w-ueDVRfu-cs8xqh4yuuUvPIMQ');
    
    // Update Gemini service with the API key
    geminiService.updateConfig({ 
      apiKey: 'AIzaSyB6F_bQ2w-ueDVRfu-cs8xqh4yuuUvPIMQ',
      model: 'gemini-2.0-flash-exp',
      temperature: 0.7
    });
  }, []);

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const availableVoices = speechService.getAvailableVoices();
      setVoices(availableVoices);
      
      // Set default voice (prefer English female voice)
      const defaultVoice = availableVoices.find(voice => 
        voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
      ) || availableVoices.find(voice => voice.lang.startsWith('en'));
      
      if (defaultVoice) {
        setSelectedVoice(defaultVoice.name);
      }
    };

    loadVoices();
    
    // Listen for voice changes
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const testTextToSpeech = async () => {
    if (isPlaying) {
      speechService.stopSpeaking();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    try {
      await speechService.speak(testText, {
        voice: selectedVoice,
        rate: speechRate,
        pitch: speechPitch,
        volume: speechVolume
      });
    } catch (error) {
      console.error('TTS Error:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const testSpeechToText = async () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setRecognizedText('');

    try {
      await speechService.startListening({
        onResult: (transcript, isFinal) => {
          if (isFinal) {
            setRecognizedText(transcript);
            setIsListening(false);
          }
        },
        onError: (error) => {
          console.error('STT Error:', error);
          setIsListening(false);
        },
        onEnd: () => {
          setIsListening(false);
        }
      });
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsListening(false);
    }
  };

  const testGeminiConnection = async () => {
    setTestStatus('testing');
    try {
      const response = await geminiService.processCallInteraction(
        "Hello, this is a test message",
        {
          contactType: 'student',
          contactName: 'Test User',
          transcript: [],
          sessionDuration: 0
        }
      );
      
      if (response.response) {
        setTestStatus('success');
        setTimeout(() => setTestStatus('idle'), 3000);
      } else {
        setTestStatus('error');
        setTimeout(() => setTestStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Gemini test failed:', error);
      setTestStatus('error');
      setTimeout(() => setTestStatus('idle'), 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Voice Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Volume2 className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Text-to-Speech Configuration</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice Selection
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Default Voice</option>
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Speech Rate: {speechRate.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Speech Pitch: {speechPitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speechPitch}
              onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Speech Volume: {Math.round(speechVolume * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={speechVolume}
              onChange={(e) => setSpeechVolume(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Text
          </label>
          <div className="flex space-x-3">
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Enter text to test speech synthesis..."
            />
            <button
              onClick={testTextToSpeech}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                isPlaying
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Stop' : 'Test'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Speech Recognition */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Mic className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Speech-to-Text Configuration</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={testSpeechToText}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                isListening
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
              <span>{isListening ? 'Stop Listening' : 'Start Listening'}</span>
            </button>

            {isListening && (
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Listening...</span>
              </div>
            )}
          </div>

          {recognizedText && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 mb-2">Recognized Speech:</h4>
              <p className="text-green-700">{recognizedText}</p>
            </div>
          )}
        </div>
      </div>

      {/* Gemini AI Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Brain className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Gemini 2.0 Flash Configuration</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Status
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium">Connected</span>
              </div>
              <button
                onClick={testGeminiConnection}
                disabled={testStatus === 'testing'}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  testStatus === 'testing' 
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : testStatus === 'success'
                    ? 'bg-green-600 text-white'
                    : testStatus === 'error'
                    ? 'bg-red-600 text-white'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {testStatus === 'testing' && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                {testStatus === 'success' && <CheckCircle className="w-4 h-4" />}
                {testStatus === 'error' && <AlertCircle className="w-4 h-4" />}
                {testStatus === 'idle' && <Zap className="w-4 h-4" />}
                <span>
                  {testStatus === 'testing' ? 'Testing...' :
                   testStatus === 'success' ? 'Success!' :
                   testStatus === 'error' ? 'Failed' :
                   'Test Connection'}
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model Selection
            </label>
            <select
              value={geminiModel}
              onChange={(e) => {
                setGeminiModel(e.target.value);
                geminiService.updateConfig({ model: e.target.value });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Experimental)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature: {geminiTemperature.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={geminiTemperature}
              onChange={(e) => {
                const temp = parseFloat(e.target.value);
                setGeminiTemperature(temp);
                geminiService.updateConfig({ temperature: temp });
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower values = more focused, Higher values = more creative
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-purple-800 mb-2 flex items-center">
              <Zap className="w-4 h-4 mr-1" />
              Gemini 2.0 Flash Features:
            </h4>
            <div className="space-y-1 text-sm text-purple-700">
              <div>✓ Advanced natural language understanding</div>
              <div>✓ Real-time context-aware responses</div>
              <div>✓ Multi-turn conversation handling</div>
              <div>✓ Intelligent action suggestions</div>
              <div>✓ Enhanced reasoning capabilities</div>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Commands Guide */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI-Enhanced Voice Commands</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h4 className="font-medium text-gray-900 mb-2">Student Management</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• "Tell me about [student name]"</li>
                <li>• "What's the status of applications?"</li>
                <li>• "Show me students from IIT Delhi"</li>
                <li>• "Who has the highest CGPA?"</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h4 className="font-medium text-gray-900 mb-2">Job Management</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• "What internships are available?"</li>
                <li>• "Tell me about the developer position"</li>
                <li>• "What are the requirements for this job?"</li>
                <li>• "Which companies are hiring?"</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h4 className="font-medium text-gray-900 mb-2">Communication</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• "Send the application form"</li>
                <li>• "Schedule a meeting with [name]"</li>
                <li>• "When is the next interview?"</li>
                <li>• "Send them the job details"</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h4 className="font-medium text-gray-900 mb-2">Natural Conversation</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• "How many students applied today?"</li>
                <li>• "What's the selection process?"</li>
                <li>• "Can you help me with onboarding?"</li>
                <li>• "Thanks, that's all for now"</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <h4 className="font-medium text-purple-800">Powered by Gemini 2.0 Flash</h4>
          </div>
          <p className="text-sm text-purple-700">
            The system uses Google's most advanced Gemini 2.0 Flash model for superior natural language understanding 
            and intelligent responses. You can ask any question or make any request naturally - the AI will understand 
            your intent and provide comprehensive, context-aware responses about students, jobs, and intern management processes.
          </p>
        </div>
      </div>
    </div>
  );
};