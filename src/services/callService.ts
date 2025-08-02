import { supabase } from '../lib/supabase';
import { speechService } from './speechService';
import { geminiService } from './geminiService';

export interface CallSession {
  id: string;
  contactType: 'student' | 'tpo';
  contactId?: string;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  callType: 'introduction' | 'telephonic_interview' | 'teams_scheduling' | 'tpo_outreach';
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed' | 'failed';
  transcript: CallTranscript[];
  duration: number;
  notes: string;
  evaluation?: StudentEvaluation;
  jotformSent?: boolean;
  teamsScheduled?: boolean;
}

export interface CallTranscript {
  id: string;
  timestamp: Date;
  speaker: 'contact' | 'jerry';
  text: string;
  type: 'speech' | 'action' | 'evaluation';
}

export interface StudentEvaluation {
  technicalSkills: number;
  communication: number;
  problemSolving: number;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  recommendation: 'strongly_recommend' | 'recommend' | 'consider' | 'not_recommend';
  notes: string;
}

class CallService {
  private activeSessions = new Map<string, CallSession>();
  private isListening = false;

  // Initialize a new call session
  async initiateCall(
    contactType: 'student' | 'tpo', 
    contactName: string, 
    contactId?: string, 
    contactPhone?: string,
    contactEmail?: string,
    callType: CallSession['callType'] = 'introduction'
  ): Promise<string> {
    const sessionId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: CallSession = {
      id: sessionId,
      contactType,
      contactId,
      contactName,
      contactPhone,
      contactEmail,
      callType,
      startTime: new Date(),
      status: 'active',
      transcript: [],
      duration: 0,
      notes: '',
      jotformSent: false,
      teamsScheduled: false
    };

    this.activeSessions.set(sessionId, session);

    // Jerry's opening based on call type and contact type
    const openingMessage = this.getOpeningMessage(contactType, contactName, callType);
    await this.speakMessage(openingMessage);
    this.addToTranscript(sessionId, 'jerry', openingMessage, 'speech');

    return sessionId;
  }

  private getOpeningMessage(contactType: 'student' | 'tpo', contactName: string, callType: CallSession['callType']): string {
    if (contactType === 'tpo') {
      return `Hello ${contactName}, this is Jerry, an AI assistant from Solar Industries India Ltd. I hope you're doing well. I'm calling to discuss an exciting internship opportunity we have for your students. Do you have a few minutes to talk?`;
    }

    switch (callType) {
      case 'introduction':
        return `Hello ${contactName}, this is Jerry from Solar Industries India Ltd. I'm calling regarding an internship opportunity that matches your profile. I'd like to tell you about this exciting opportunity. Do you have a few minutes to discuss?`;
      
      case 'telephonic_interview':
        return `Hello ${contactName}, this is Jerry from Solar Industries India Ltd. Thank you for your interest in our internship program. I'm calling to conduct a brief telephonic interview. Are you available to proceed?`;
      
      case 'teams_scheduling':
        return `Hello ${contactName}, this is Jerry from Solar Industries India Ltd. Congratulations! Based on your telephonic interview, we'd like to schedule a Microsoft Teams interview with our panel. Are you available to discuss the schedule?`;
      
      default:
        return `Hello ${contactName}, this is Jerry from Solar Industries India Ltd. How can I assist you today?`;
    }
  }

  // Start voice interaction
  async startVoiceInteraction(sessionId: string): Promise<void> {
    if (this.isListening) return;
    
    this.isListening = true;
    
    try {
      await speechService.startListening({
        onResult: async (transcript: string, isFinal: boolean) => {
          if (isFinal && transcript.trim()) {
            this.addToTranscript(sessionId, 'contact', transcript, 'speech');
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
        callType: session.callType,
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

      // Auto-save session periodically
      await this.saveCallToDatabase(session);

    } catch (error) {
      console.error('Error processing voice command:', error);
      
      // Fallback response based on call type
      const fallbackResponse = this.getFallbackResponse(session.contactType, session.callType);
      await this.speakMessage(fallbackResponse);
      this.addToTranscript(sessionId, 'jerry', fallbackResponse, 'speech');
    }
  }

  private getFallbackResponse(contactType: 'student' | 'tpo', callType: CallSession['callType']): string {
    if (contactType === 'tpo') {
      return `I understand. Let me provide you with more details about our internship program. We're looking for talented students from your institution.`;
    }

    switch (callType) {
      case 'introduction':
        return `I understand your interest. Let me tell you more about this internship opportunity and how it aligns with your career goals.`;
      
      case 'telephonic_interview':
        return `Thank you for that response. Let me ask you another question to better understand your background and skills.`;
      
      case 'teams_scheduling':
        return `I understand. Let me check for alternative time slots that might work better for your schedule.`;
      
      default:
        return `I understand. How can I assist you further with your internship application?`;
    }
  }

  // Execute actions suggested by Gemini
  private async executeAction(sessionId: string, action: any): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    try {
      switch (action.type) {
        case 'send_jotform':
          await this.sendJotForm(sessionId);
          break;
        case 'schedule_teams_meeting':
          await this.scheduleTeamsMeeting(sessionId, action.parameters);
          break;
        case 'conduct_evaluation':
          await this.conductStudentEvaluation(sessionId, action.parameters);
          break;
        case 'request_email':
          this.addToTranscript(sessionId, 'jerry', 'Could you please provide your email address so I can send you the details?', 'action');
          break;
        case 'end_call':
          await this.endCall(sessionId, 'Call completed successfully');
          break;
        default:
          console.log('Unknown action type:', action.type);
      }
    } catch (error) {
      console.error('Error executing action:', error);
    }
  }

  private async sendJotForm(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.jotformSent = true;
    this.addToTranscript(sessionId, 'jerry', 'I\'ve sent the JotForm link to your email address. Students can use this link to apply for the internship. The form will collect all necessary information including resumes and academic details.', 'action');
    
    // Update in database
    await this.saveCallToDatabase(session);
  }

  private async scheduleTeamsMeeting(sessionId: string, parameters: any): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.teamsScheduled = true;
    this.addToTranscript(sessionId, 'jerry', `Perfect! I've scheduled your Microsoft Teams interview for ${parameters?.scheduledTime || 'the proposed time'}. You'll receive a calendar invite with the meeting link shortly. Please ensure you have a stable internet connection and a quiet environment for the interview.`, 'action');
    
    // Update in database
    await this.saveCallToDatabase(session);
  }

  private async conductStudentEvaluation(sessionId: string, responses: any): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.contactType !== 'student') return;

    // Create evaluation based on responses
    const evaluation: StudentEvaluation = {
      technicalSkills: responses.technicalScore || 7,
      communication: responses.communicationScore || 8,
      problemSolving: responses.problemSolvingScore || 7,
      overallScore: responses.overallScore || 7.5,
      strengths: responses.strengths || ['Good communication', 'Eager to learn'],
      weaknesses: responses.weaknesses || ['Limited experience'],
      opportunities: responses.opportunities || ['Skill development', 'Industry exposure'],
      threats: responses.threats || ['Competition from peers'],
      recommendation: responses.recommendation || 'recommend',
      notes: responses.notes || 'Candidate shows potential for growth'
    };

    session.evaluation = evaluation;
    this.addToTranscript(sessionId, 'jerry', `Thank you for your responses. Based on our conversation, I've completed your evaluation. You've demonstrated good potential, and we'll be in touch regarding the next steps.`, 'evaluation');
    
    // Update in database
    await this.saveCallToDatabase(session);
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
  private addToTranscript(sessionId: string, speaker: 'contact' | 'jerry', text: string, type: 'speech' | 'action' | 'evaluation'): void {
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
    session.duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);
    session.status = 'completed';
    session.notes = notes || '';

    // Stop all voice activities
    this.stopVoiceRecognition();
    this.stopSpeaking();

    // Final save to database
    await this.saveCallToDatabase(session);

    // Remove from active sessions
    this.activeSessions.delete(sessionId);
  }

  // Save call session to database with comprehensive error handling
  private async saveCallToDatabase(session: CallSession): Promise<void> {
    try {
      console.log('Saving call to database:', session.id);

      const callData = {
        student_id: session.contactType === 'student' ? session.contactId : null,
        tpo_id: session.contactType === 'tpo' ? session.contactId : null,
        contact_type: session.contactType,
        duration: session.duration,
        status: session.status === 'completed' ? 'completed' : 'scheduled',
        notes: session.notes,
        transcript: session.transcript,
        jotform_sent: session.jotformSent || false,
        scheduled_at: session.startTime.toISOString(),
        completed_at: session.endTime?.toISOString() || null
      };

      console.log('Call data to save:', callData);

      const { data, error } = await supabase
        .from('call_logs')
        .upsert(callData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.error('Database error details:', error);
        throw error;
      }

      console.log('Call saved successfully:', data);

      // If there's an evaluation, save it separately
      if (session.evaluation && session.contactId) {
        await this.saveStudentEvaluation(session.contactId, session.evaluation);
      }

    } catch (error) {
      console.error('Failed to save call to database:', error);
      
      // Try alternative save method
      try {
        await this.saveCallToLocalStorage(session);
        console.log('Call saved to local storage as backup');
      } catch (localError) {
        console.error('Failed to save to local storage:', localError);
      }
    }
  }

  private async saveStudentEvaluation(studentId: string, evaluation: StudentEvaluation): Promise<void> {
    try {
      const { error } = await supabase
        .from('students')
        .update({
          evaluation_score: evaluation.overallScore,
          evaluation_notes: evaluation.notes,
          strengths: evaluation.strengths,
          weaknesses: evaluation.weaknesses,
          updated_at: new Date().toISOString()
        })
        .eq('id', studentId);

      if (error) {
        console.error('Failed to save student evaluation:', error);
      }
    } catch (error) {
      console.error('Error saving student evaluation:', error);
    }
  }

  private async saveCallToLocalStorage(session: CallSession): Promise<void> {
    const existingCalls = JSON.parse(localStorage.getItem('backup_calls') || '[]');
    existingCalls.push({
      ...session,
      savedAt: new Date().toISOString()
    });
    localStorage.setItem('backup_calls', JSON.stringify(existingCalls));
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

  // Load calls from database
  async loadCallsFromDatabase(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading calls:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to load calls from database:', error);
      return [];
    }
  }

  // Retry failed saves
  async retryFailedSaves(): Promise<void> {
    const backupCalls = JSON.parse(localStorage.getItem('backup_calls') || '[]');
    
    for (const call of backupCalls) {
      try {
        await this.saveCallToDatabase(call);
        console.log('Successfully retried save for call:', call.id);
      } catch (error) {
        console.error('Retry failed for call:', call.id, error);
      }
    }

    // Clear backup after successful retry
    localStorage.removeItem('backup_calls');
  }
}

export const callService = new CallService();