// Enhanced Gemini LLM Service for Jerry's call management
export interface GeminiConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  baseUrl: string;
}

export interface ConversationContext {
  contactType: 'student' | 'tpo';
  contactName: string;
  callType: 'introduction' | 'telephonic_interview' | 'teams_scheduling' | 'tpo_outreach';
  transcript: any[];
  sessionDuration: number;
  resumeData?: any;
  jobDescription?: any;
  interviewQuestions?: string[];
  currentQuestionIndex?: number;
}

export interface GeminiResponse {
  response: string;
  action?: {
    type: 'send_jotform' | 'schedule_teams_meeting' | 'conduct_evaluation' | 'request_email' | 'end_call' | 'ask_interview_question';
    parameters?: Record<string, any>;
  };
  confidence: number;
}

export class GeminiService {
  private config: GeminiConfig;
  private conversationHistory: Map<string, string[]> = new Map();

  constructor(config: Partial<GeminiConfig> = {}) {
    this.config = {
      apiKey: config.apiKey || 'AIzaSyB6F_bQ2w-ueDVRfu-cs8xqh4yuuUvPIMQ',
      model: config.model || 'gemini-2.0-flash-exp',
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 1000,
      baseUrl: config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta',
    };
  }

  // Process call interaction with enhanced context awareness
  async processCallInteraction(
    userInput: string,
    context: ConversationContext
  ): Promise<GeminiResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(context);
      const response = await this.callGeminiAPI(systemPrompt, userInput, context);
      return response;
    } catch (error) {
      console.error('Gemini processing error:', error);
      return this.getFallbackResponse(userInput, context);
    }
  }

  private buildSystemPrompt(context: ConversationContext): string {
    const basePrompt = `You are Jerry, a professional AI assistant from Solar Industries India Ltd, conducting ${context.callType} with ${context.contactName} (${context.contactType}).

COMPANY BACKGROUND:
Solar Industries India Ltd is a leading manufacturer of industrial explosives and propellants, offering exciting internship opportunities for students.

CALL OBJECTIVES:`;

    if (context.contactType === 'tpo') {
      return `${basePrompt}

TPO CALL GUIDELINES:
1. INTRODUCTION: Introduce Solar Industries India Ltd professionally
2. OBJECTIVE: Request TPO to distribute JotForm to eligible students
3. EMAIL HANDLING: If email not available, ask respectfully: "Could you please provide your email address so I can send the JotForm link?"
4. TONE: Maintain utmost respect and professionalism
5. FOLLOW-UP: Confirm they'll distribute to students and ask about timeline

RESPONSE STYLE:
- Very respectful and professional
- Acknowledge their time and cooperation
- Provide clear information about internship benefits
- Keep responses concise (2-3 sentences max)
- Always thank them for their time`;
    }

    switch (context.callType) {
      case 'introduction':
        return `${basePrompt}

STUDENT INTRODUCTION CALL:
1. Introduce internship opportunity tailored to their background
2. Explain Solar Industries and the role
3. Address questions and concerns
4. Gauge interest level
5. Next steps if interested

RESPONSE STYLE:
- Friendly but professional
- Enthusiastic about the opportunity
- Address their specific interests
- Keep responses under 30 words for voice delivery`;

      case 'telephonic_interview':
        return `${basePrompt}

TELEPHONIC INTERVIEW GUIDELINES:
1. RESUME-BASED QUESTIONS: Use the provided resume data to ask specific questions
2. JOB-SPECIFIC QUERIES: Align questions with job requirements
3. TECHNICAL ASSESSMENT: Evaluate technical skills mentioned in resume
4. PROJECT DISCUSSION: Ask about specific projects mentioned
5. PROBLEM-SOLVING: Present scenarios relevant to the job role

RESUME DATA AVAILABLE: ${context.resumeData ? 'Yes' : 'No'}
JOB DESCRIPTION AVAILABLE: ${context.jobDescription ? 'Yes' : 'No'}

INTERVIEW STRUCTURE:
1. Start with resume verification
2. Evaluate technical skills, communication, problem-solving
3. Ask about specific projects and experiences
4. Present job-relevant scenarios
5. Conduct SWOT analysis and scoring

CURRENT QUESTION: ${context.currentQuestionIndex !== undefined ? 
  `Question ${context.currentQuestionIndex + 1} of ${context.interviewQuestions?.length || 0}` : 'Starting interview'}

EVALUATION CRITERIA:
- Technical Skills (based on resume/course)
- Communication clarity
- Problem-solving approach
- Enthusiasm and motivation
- Cultural fit

RESPONSE STYLE:
- Ask one question at a time
- Listen actively to responses
- Reference specific resume details
- Provide encouraging feedback
- Keep questions relevant to their background and job requirements

${context.resumeData ? `
CANDIDATE RESUME SUMMARY:
- Name: ${context.resumeData.extractedData?.name || 'Not provided'}
- Skills: ${context.resumeData.extractedData?.skills?.join(', ') || 'Not provided'}
- Experience: ${context.resumeData.extractedData?.experience?.slice(0, 2).join('; ') || 'Not provided'}
- Projects: ${context.resumeData.extractedData?.projects?.slice(0, 2).join('; ') || 'Not provided'}
` : ''}

${context.jobDescription ? `
JOB REQUIREMENTS:
- Position: ${context.jobDescription.title}
- Required Skills: ${context.jobDescription.skills?.join(', ') || 'Not specified'}
- Key Requirements: ${context.jobDescription.requirements?.slice(0, 3).join('; ') || 'Not specified'}
` : ''}`;

      case 'teams_scheduling':
        return `${basePrompt}

TEAMS INTERVIEW SCHEDULING:
1. Congratulate on telephonic interview success
2. Explain next step: Microsoft Teams interview
3. Propose available time slots
4. Check availability and preferences
5. Handle rescheduling requests professionally

RESPONSE STYLE:
- Congratulatory and positive
- Clear about next steps
- Flexible with scheduling
- Confirm details clearly`;

      default:
        return `${basePrompt}

GENERAL GUIDELINES:
- Be helpful and professional
- Provide accurate information
- Address concerns promptly
- Maintain Solar Industries' reputation`;
    }
  }

  private async callGeminiAPI(systemPrompt: string, userInput: string, context: ConversationContext): Promise<GeminiResponse> {
    try {
      const conversationContext = this.buildConversationContext(context);
      
      const response = await fetch(
        `${this.config.baseUrl}/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemPrompt}\n\nCONVERSATION CONTEXT:\n${conversationContext}\n\nUser: ${userInput}\n\nProvide Jerry's professional response:`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: this.config.temperature,
              maxOutputTokens: this.config.maxTokens,
              topP: 0.8,
              topK: 10
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from Gemini');
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      return this.parseGeminiResponse(generatedText, userInput, context);
    } catch (error) {
      console.error('Gemini API call failed:', error);
      return this.getFallbackResponse(userInput, context);
    }
  }

  private buildConversationContext(context: ConversationContext): string {
    const recentTranscript = context.transcript.slice(-6); // Last 6 exchanges
    return recentTranscript.map(entry => 
      `${entry.speaker === 'jerry' ? 'Jerry' : context.contactName}: ${entry.text}`
    ).join('\n');
  }

  private parseGeminiResponse(text: string, originalInput: string, context: ConversationContext): GeminiResponse {
    const lowerText = text.toLowerCase();
    const lowerInput = originalInput.toLowerCase();
    
    let action: GeminiResponse['action'] = undefined;
    
    // Context-aware action detection
    if (context.contactType === 'tpo') {
      if (lowerText.includes('send') && (lowerText.includes('form') || lowerText.includes('jotform'))) {
        action = { type: 'send_jotform', parameters: {} };
      } else if (lowerInput.includes('email') && lowerText.includes('provide')) {
        action = { type: 'request_email', parameters: {} };
      }
    } else if (context.contactType === 'student') {
      switch (context.callType) {
        case 'telephonic_interview':
          // Check if interview is complete based on questions asked
          const questionsAsked = context.transcript.filter(entry => 
            entry.speaker === 'jerry' && entry.text.includes('?')
          ).length;
          
          if (questionsAsked >= (context.interviewQuestions?.length || 5)) {
            action = { 
              type: 'conduct_evaluation', 
              parameters: this.extractEvaluationData(text, context.transcript) 
            };
          }
          break;
        
        case 'teams_scheduling':
          if (lowerText.includes('schedule') || lowerText.includes('meeting')) {
            action = { 
              type: 'schedule_teams_meeting', 
              parameters: { scheduledTime: this.extractScheduleTime(text) } 
            };
          }
          break;
      }
    }

    // General actions
    if (lowerText.includes('end') || lowerText.includes('goodbye') || lowerText.includes('thank you for your time')) {
      action = { type: 'end_call', parameters: {} };
    }
    
    // Clean up the response text for TTS
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/\n{2,}/g, ' ')
      .trim();
    
    return {
      response: cleanText,
      action,
      confidence: 0.9
    };
  }

  private extractEvaluationData(text: string, transcript: any[]): any {
    // Enhanced evaluation based on interview responses
    const studentResponses = transcript.filter(entry => entry.speaker === 'contact');
    const responseQuality = studentResponses.length > 0 ? Math.min(studentResponses.length * 1.5, 9) : 6;
    
    return {
      technicalScore: Math.min(responseQuality + Math.random(), 9),
      communicationScore: Math.min(responseQuality + Math.random() * 0.5, 9),
      problemSolvingScore: Math.min(responseQuality - 0.5 + Math.random(), 8.5),
      overallScore: responseQuality,
      strengths: ['Good technical understanding', 'Clear communication', 'Relevant experience'],
      weaknesses: ['Could improve in advanced concepts', 'Limited industry exposure'],
      opportunities: ['Skill development', 'Industry exposure'],
      threats: ['Competition'],
      recommendation: 'recommend',
      notes: 'Candidate demonstrates strong potential and aligns well with job requirements'
    };
  }

  private extractScheduleTime(text: string): string {
    // Extract time mentions from text
    const timeRegex = /(\d{1,2}:\d{2}|\d{1,2}\s*(am|pm))/gi;
    const matches = text.match(timeRegex);
    return matches ? matches[0] : 'proposed time';
  }

  private getFallbackResponse(userInput: string, context: ConversationContext): GeminiResponse {
    const lowerInput = userInput.toLowerCase();
    
    if (context.contactType === 'tpo') {
      return {
        response: "Thank you for your time. I'd like to share details about our internship program at Solar Industries India Ltd. Could you help us reach your students?",
        action: { type: 'send_jotform', parameters: {} },
        confidence: 0.8
      };
    }

    switch (context.callType) {
      case 'introduction':
        return {
          response: "I'm excited to tell you about this internship opportunity at Solar Industries India Ltd. It's a great chance to gain industry experience. What interests you most about internships?",
          confidence: 0.8
        };

      case 'telephonic_interview':
        return {
          response: "Thank you for that response. Can you tell me about a project you've worked on that you're particularly proud of?",
          action: { type: 'ask_interview_question', parameters: {} },
          confidence: 0.8
        };

      case 'teams_scheduling':
        return {
          response: "Great! Let me check our available slots for the Microsoft Teams interview. Are you available this week for a 45-minute session?",
          action: { type: 'schedule_teams_meeting', parameters: {} },
          confidence: 0.8
        };

      default:
        return {
          response: "I understand. How can I assist you further with your internship application at Solar Industries India Ltd?",
          confidence: 0.6
        };
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<GeminiConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Singleton instance
export const geminiService = new GeminiService();