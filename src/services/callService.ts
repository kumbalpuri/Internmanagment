import { speechService } from './speechService';
import { geminiService, ConversationContext } from './geminiService';
import { supabase } from '../lib/supabase';
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
  speaker: 'agent' | 'jerry';
  text: string;
  type: 'speech';
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

    // Get contact name for personalized greeting
    const contactName = await this.getContactName(session);

    // Personalized welcome message from Jerry
    const welcomeMessage = `Hi ${contactName}, This is Jerry an AI assistant from Solar Industries India Ltd. How can I assist you today?`;
    await this.speakMessage(welcomeMessage);
    this.addToTranscript(sessionId, 'jerry', welcomeMessage, 'speech');

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
            this.processVoiceCommand(sessionId, transcript);
          }
        },
        onError: (error) => {
          console.error('Speech recognition error:', error);
        },
        onStart: () => {
        },
        onEnd: () => {
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

    // Add user input to transcript
    this.addToTranscript(sessionId, 'agent', transcript, 'speech');
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
        sessionId,
        true // Request short response
      );

      // Remove processing indicator
      if (geminiResponse.action) {
        await this.executeAction(sessionId, geminiResponse.action);
      }

      // Speak the response
      await this.speakMessage(geminiResponse.text);
      this.addToTranscript(sessionId, 'jerry', geminiResponse.text, 'speech');

    } catch (error) {
      console.error('Error processing voice command with Gemini:', error);
      
      // Fallback to simple response
      const fallbackResponse = `I understand you said: "${transcript}". How can I assist you further with student management, job descriptions, or meeting scheduling?`;
      await this.speakMessage(fallbackResponse);
      this.addToTranscript(sessionId, 'jerry', fallbackResponse, 'speech');
    }
  }

  // Execute actions suggested by Gemini
  private async executeAction(sessionId: string, action: any): Promise<void> {
    switch (action.type) {
      case 'send_jotform':
        break;
      
      case 'schedule_meeting':
        break;
      
      case 'schedule_teams_meeting':
        break;
      
      case 'evaluate_resume':
        break;
      
      case 'shortlist_students':
        break;
      
      case 'get_student_info':
        break;
      
      case 'get_job_info':
        break;
      
      case 'end_call':
        setTimeout(() => this.endCall(sessionId), 2000);
        break;
      
      default:
        console.log('Unknown action type:', action.type);
    }
  }

  // Get contact name helper
  private async getContactName(session: CallSession): Promise<string> {
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
  private addToTranscript(sessionId: string, speaker: 'agent' | 'jerry', text: string, type: 'speech'): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    const transcriptEntry: CallTranscript = {
      id: `transcript_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      speaker,
      text,
      type: 'speech'
    };

    session.transcript.push(transcriptEntry);
  }

  // End call session
  async endCall(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    // Save call log to database
    await this.saveCallLog(session);

    session.status = 'ended';
    session.duration = Math.floor((new Date().getTime() - session.startTime.getTime()) / 1000);

    // Stop any ongoing speech recognition or synthesis
    speechService.stopListening();
    speechService.stopSpeaking();

    // Clear Gemini conversation history
    geminiService.clearConversationHistory(sessionId);

    if (this.currentSession?.id === sessionId) {
      this.currentSession = null;
    }
  }

  // Save call log to database
  private async saveCallLog(session: CallSession): Promise<void> {
    try {
      await supabase.from('call_logs').insert({
        student_id: session.contactType === 'student' ? session.contactId : null,
        tpo_id: session.contactType === 'tpo' ? session.contactId : null,
        contact_type: session.contactType,
        duration: Math.floor((new Date().getTime() - session.startTime.getTime()) / 1000),
        status: 'completed',
        notes: `Call with ${session.contactType}`,
        transcript: session.transcript,
        jotform_sent: false,
        completed_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving call log:', error);
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