import { speechService } from './speechService';
import { geminiService, ConversationContext } from './geminiService';
import { mockStudents, mockJobDescriptions } from '../data/mockData';

export interface CallSession {
  id: string;
  contactId: string;
  contactType: 'student' | 'tpo';
  startTime: Date;
  transcript: CallTranscript[];
  status: 'active' | 'ended';
  duration: number;
}

export interface CallTranscript {
  id: string;
  timestamp: Date;
  speaker: 'agent' | 'system';
  text: string;
  type: 'speech' | 'action' | 'note';
}

export class CallService {
  private activeSessions: Map<string, CallSession> = new Map();
  private currentSession: CallSession | null = null;

  // Simulate call initiation
  async initiateCall(contactId: string, contactType: 'student' | 'tpo'): Promise<CallSession> {
    const sessionId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: CallSession = {
      id: sessionId,
      contactId,
      contactType,
      startTime: new Date(),
      transcript: [],
      status: 'active',
      duration: 0
    };

    this.activeSessions.set(sessionId, session);
    this.currentSession = session;

    // Add initial system message
    this.addToTranscript(sessionId, 'system', `Call initiated with ${contactType}`, 'action');

    // Welcome message
    const welcomeMessage = `Hello, this is an automated call from the Intern Management System. How can I assist you today?`;
    await this.speakMessage(welcomeMessage);
    this.addToTranscript(sessionId, 'system', welcomeMessage, 'speech');

    return session;
  }

  // Add voice-powered interaction
  async startVoiceInteraction(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    try {
      await speechService.startListening({
        onResult: (transcript, isFinal) => {
          if (isFinal) {
            this.addToTranscript(sessionId, 'agent', transcript, 'speech');
            this.processVoiceCommand(sessionId, transcript);
          }
        },
        onError: (error) => {
          console.error('Speech recognition error:', error);
          this.addToTranscript(sessionId, 'system', `Speech recognition error: ${error}`, 'action');
        },
        onStart: () => {
          this.addToTranscript(sessionId, 'system', 'Voice recognition started', 'action');
        },
        onEnd: () => {
          this.addToTranscript(sessionId, 'system', 'Voice recognition ended', 'action');
        }
      });
    } catch (error) {
      console.error('Failed to start voice interaction:', error);
      throw error;
    }
  }

  // Process voice commands using NLP-like logic
  private async processVoiceCommand(sessionId: string, transcript: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    try {
      // Build context for Gemini
      const context: ConversationContext = {
        contactType: session.contactType,
        contactName: this.getContactName(session),
        contactId: session.contactId,
        callHistory: session.transcript.map(t => `${t.speaker}: ${t.text}`),
        systemContext: {
          availableStudents: mockStudents,
          availableJobs: mockJobDescriptions,
          recentActivities: []
        }
      };

      // Get intelligent response from Gemini
      const geminiResponse = await geminiService.generateResponse(
        transcript,
        context,
        sessionId
      );

      // Remove processing indicator
      if (geminiResponse.action) {
        await this.executeAction(sessionId, geminiResponse.action);
      }

      // Speak the response
      await this.speakMessage(geminiResponse.text);
      this.addToTranscript(sessionId, 'system', geminiResponse.text, 'speech');

    } catch (error) {
      console.error('Error processing voice command with Gemini:', error);
      
      // Fallback to simple response
      const fallbackResponse = `I understand you said: "${transcript}". How can I assist you further with student management, job descriptions, or meeting scheduling?`;
      await this.speakMessage(fallbackResponse);
      this.addToTranscript(sessionId, 'system', fallbackResponse, 'speech');
    }
  }

  // Execute actions suggested by Gemini
  private async executeAction(sessionId: string, action: any): Promise<void> {
    switch (action.type) {
      case 'send_jotform':
        this.addToTranscript(sessionId, 'system', 'JotForm sent to contact via email and SMS', 'action');
        break;
      
      case 'schedule_meeting':
        this.addToTranscript(sessionId, 'system', 'Meeting scheduling initiated - Teams invite will be sent', 'action');
        break;
      
      case 'schedule_teams_meeting':
        this.addToTranscript(sessionId, 'system', 'Microsoft Teams meeting scheduled - Invitations sent to student and interview panel', 'action');
        break;
      
      case 'evaluate_resume':
        this.addToTranscript(sessionId, 'system', 'Resume evaluation completed - Shortlist prepared based on job requirements', 'action');
        break;
      
      case 'shortlist_students':
        this.addToTranscript(sessionId, 'system', 'Student shortlist created with detailed evaluation reasons', 'action');
        break;
      
      case 'get_student_info':
        this.addToTranscript(sessionId, 'system', 'Student information retrieved from database', 'action');
        break;
      
      case 'get_job_info':
        this.addToTranscript(sessionId, 'system', 'Job description information accessed', 'action');
        break;
      
      case 'end_call':
        setTimeout(() => this.endCall(sessionId), 2000);
        break;
      
      default:
        console.log('Unknown action type:', action.type);
    }
  }

  // Get contact name helper
  private getContactName(session: CallSession): string {
    if (session.contactType === 'student') {
      const student = mockStudents.find(s => s.id === session.contactId);
      return student?.name || 'Unknown Student';
    } else {
      // For TPO, you would fetch from TPO data
      return 'TPO Contact';
    }
  }


  // Speak a message using TTS
  private async speakMessage(message: string): Promise<void> {
    try {
      // Stop any current speech before starting new one
      speechService.stopSpeaking();
      
      // Small delay to ensure previous speech is fully stopped
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await speechService.speak(message, {
        rate: 0.9,
        pitch: 1.0,
        volume: 0.8
      });
    } catch (error) {
      console.error('TTS Error:', error);
    }
  }

  // Add entry to call transcript
  private addToTranscript(sessionId: string, speaker: 'agent' | 'system', text: string, type: 'speech' | 'action' | 'note'): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    const transcriptEntry: CallTranscript = {
      id: `transcript_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      speaker,
      text,
      type
    };

    session.transcript.push(transcriptEntry);
  }

  // End call session
  async endCall(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.status = 'ended';
    session.duration = Math.floor((new Date().getTime() - session.startTime.getTime()) / 1000);

    // Stop any ongoing speech recognition or synthesis
    speechService.stopListening();
    speechService.stopSpeaking();

    // Clear Gemini conversation history
    geminiService.clearConversationHistory(sessionId);
    this.addToTranscript(sessionId, 'system', `Call ended. Duration: ${session.duration} seconds`, 'action');

    if (this.currentSession?.id === sessionId) {
      this.currentSession = null;
    }
  }

  // Get current active session
  getCurrentSession(): CallSession | null {
    return this.currentSession;
  }

  // Get session by ID
  getSession(sessionId: string): CallSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  // Get all sessions
  getAllSessions(): CallSession[] {
    return Array.from(this.activeSessions.values());
  }

  // Stop voice recognition
  stopVoiceRecognition(): void {
    speechService.stopListening();
  }

  // Stop text-to-speech
  stopSpeaking(): void {
    speechService.stopSpeaking();
  }
}

// Singleton instance
export const callService = new CallService();