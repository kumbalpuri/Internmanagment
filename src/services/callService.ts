import { supabase } from '../lib/supabase';
import { speechService } from './speechService';
import { geminiService } from './geminiService';

export interface CallSession {
  id: string;
  contactType: 'student' | 'tpo';
  contactId?: string;
  contactName: string;
  contactPhone?: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed' | 'failed';
  transcript: CallTranscript[];
  duration: number;
  notes: string;
}

export interface CallTranscript {
  id: string;
  timestamp: Date;
  speaker: 'agent' | 'jerry';
  text: string;
  type: 'speech' | 'action';
}

class CallService {
  private activeSessions = new Map<string, CallSession>();
  private isListening = false;

  // Initialize a new call session
  async initiateCall(contactType: 'student' | 'tpo', contactName: string, contactId?: string, contactPhone?: string): Promise<string> {
    const sessionId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: CallSession = {
      id: sessionId,
      contactType,
      contactId,
      contactName,
      contactPhone,
      startTime: new Date(),
      status: 'active',
      transcript: [],
      duration: 0,
      notes: ''
    };

    this.activeSessions.set(sessionId, session);

    // Start with Jerry's opening statement
    const openingMessage = `Hi ${contactName}, This is Jerry, an AI assistant from Solar Industries India Ltd. How can I help you today?`;
    await this.speakMessage(openingMessage);
    this.addToTranscript(sessionId, 'jerry', openingMessage, 'speech');

    return sessionId;
  }

  // Start voice interaction
  async startVoiceInteraction(sessionId: string): Promise<void> {
    if (this.isListening) return;
    
    this.isListening = true;
    
    try {
      await speechService.startListening({
        onResult: async (transcript: string, isFinal: boolean) => {
          if (isFinal && transcript.trim()) {
            this.addToTranscript(sessionId, 'agent', transcript, 'speech');
            await this.processVoiceCommand(sessionId, transcript);
          }
        },
        onError: (error: string) => {
          console.error('Speech recognition error:', error);
          this.isListening = false;
        },
        onEnd: () => {
          this.isListening = false;
        }
      });
    } catch (error) {
      console.error('Failed to start voice interaction:', error);
      this.isListening = false;
      throw error;
    }
  }

  // Process voice command with Gemini
  private async processVoiceCommand(sessionId: string, transcript: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    try {
      // Build context for Gemini
      const context = {
        contactType: session.contactType,
        contactName: session.contactName,
        transcript: session.transcript,
        sessionDuration: Date.now() - session.startTime.getTime()
      };

      // Get response from Gemini
      const geminiResponse = await geminiService.processCallInteraction(transcript, context);

      // Speak Jerry's response
      await this.speakMessage(geminiResponse.response);
      this.addToTranscript(sessionId, 'jerry', geminiResponse.response, 'speech');

      // Execute any suggested actions
      if (geminiResponse.action) {
        await this.executeAction(sessionId, geminiResponse.action);
      }

    } catch (error) {
      console.error('Error processing voice command:', error);
      
      // Fallback response
      const fallbackResponse = `I understand. How can I assist you further?`;
      await this.speakMessage(fallbackResponse);
      this.addToTranscript(sessionId, 'jerry', fallbackResponse, 'speech');
    }
  }

  // Execute actions suggested by Gemini
  private async executeAction(sessionId: string, action: any): Promise<void> {
    try {
      switch (action.type) {
        case 'send_jotform':
          this.addToTranscript(sessionId, 'jerry', 'Sending JotForm link to your email and SMS.', 'action');
          break;
        case 'schedule_meeting':
          this.addToTranscript(sessionId, 'jerry', 'Scheduling meeting with available mentors.', 'action');
          break;
        case 'get_student_info':
          this.addToTranscript(sessionId, 'jerry', 'Retrieving student profile information.', 'action');
          break;
        case 'get_job_info':
          this.addToTranscript(sessionId, 'jerry', 'Getting job description details.', 'action');
          break;
        case 'end_call':
          await this.endCall(sessionId, 'Call ended by user request');
          break;
        default:
          console.log('Unknown action type:', action.type);
      }
    } catch (error) {
      console.error('Error executing action:', error);
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
  private addToTranscript(sessionId: string, speaker: 'agent' | 'jerry', text: string, type: 'speech' | 'action'): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    const transcriptEntry: CallTranscript = {
      id: `${sessionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      speaker,
      text,
      type
    };

    session.transcript.push(transcriptEntry);
  }

  // Stop voice recognition
  stopVoiceRecognition(): void {
    this.isListening = false;
    speechService.stopListening();
  }

  // Stop speaking
  stopSpeaking(): void {
    speechService.stopSpeaking();
  }

  // End a call session
  async endCall(sessionId: string, notes?: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.endTime = new Date();
    session.duration = session.endTime.getTime() - session.startTime.getTime();
    session.status = 'completed';
    session.notes = notes || '';

    // Stop all voice activities
    this.stopVoiceRecognition();
    this.stopSpeaking();

    // Save to database
    await this.saveCallToDatabase(session);

    // Remove from active sessions
    this.activeSessions.delete(sessionId);
  }

  // Save call session to database
  private async saveCallToDatabase(session: CallSession): Promise<void> {
    try {
      const { error } = await supabase
        .from('call_logs')
        .insert({
          student_id: session.contactType === 'student' ? session.contactId : null,
          tpo_id: session.contactType === 'tpo' ? session.contactId : null,
          contact_type: session.contactType,
          duration: Math.floor(session.duration / 1000),
          status: 'completed',
          notes: session.notes,
          transcript: session.transcript,
          scheduled_at: session.startTime.toISOString(),
          completed_at: session.endTime?.toISOString()
        });

      if (error) {
        console.error('Error saving call to database:', error);
      }
    } catch (error) {
      console.error('Database error:', error);
    }
  }

  // Get active session
  getActiveSession(sessionId: string): CallSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  // Get all active sessions
  getActiveSessions(): CallSession[] {
    return Array.from(this.activeSessions.values());
  }

  // Check if listening
  isCurrentlyListening(): boolean {
    return this.isListening;
  }
}

export const callService = new CallService();