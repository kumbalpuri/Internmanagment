// Gemini LLM Service for intelligent call responses
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
  contactId: string;
  callHistory: string[];
  systemContext: {
    availableStudents: any[];
    availableJobs: any[];
    recentActivities: any[];
    openPositions?: any[];
    colleges?: any[];
    interviewPanels?: any[];
  };
}

export interface GeminiResponse {
  text: string;
  action?: {
    type: 'send_jotform' | 'schedule_meeting' | 'get_student_info' | 'get_job_info' | 'end_call' | 'evaluate_resume' | 'schedule_teams_meeting' | 'shortlist_students';
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

  // Jerry AI Agent - Automated workflow handler
  async processWorkflowStep(
    step: 'tpo_contact' | 'resume_screening' | 'interview_scheduling' | 'student_interview',
    context: any
  ): Promise<GeminiResponse> {
    const systemPrompt = this.buildWorkflowPrompt(step, context);
    
    try {
      const response = await this.callGeminiAPI(systemPrompt, '');
      return response;
    } catch (error) {
      console.error('Workflow processing error:', error);
      return this.getFallbackWorkflowResponse(step, context);
    }
  }

  private buildWorkflowPrompt(step: string, context: any): string {
    const basePrompt = `You are Jerry, an AI agent for automated intern management. You handle the complete workflow from TPO contact to student interviews.`;
    
    switch (step) {
      case 'tpo_contact':
        return `${basePrompt}

You are calling TPO ${context.tpoName} from ${context.college} about the ${context.position} opening.

Your role:
1. Greet professionally and introduce yourself as Jerry from the intern management system
2. Discuss the job requirements: ${context.requirements}
3. Ask if they're ready to share this opportunity with students
4. If yes, offer to send the JotForm link for student applications
5. Be professional, clear, and helpful

Keep responses conversational and under 100 words for voice delivery.`;

      case 'resume_screening':
        return `${basePrompt}

You are evaluating student resumes for the ${context.position} role.

Job Requirements: ${context.requirements}
Student Data: ${JSON.stringify(context.students)}

Your task:
1. Screen each student's resume against job requirements
2. Rate students on a scale of 1-10 based on:
   - Technical skills match
   - Academic performance
   - Relevant experience
   - Project work
3. Create a shortlist of top candidates with reasons
4. Provide detailed evaluation for each shortlisted candidate

Format your response as a structured evaluation.`;

      case 'student_interview':
        return `${basePrompt}

You are conducting a telephonic interview with ${context.studentName} for the ${context.position} role.

Student Background: ${context.studentProfile}
Job Requirements: ${context.requirements}

Your approach:
1. Greet the student warmly and put them at ease
2. Ask about their background and experience
3. Discuss technical skills relevant to the role
4. Ask about their interest in the position
5. Explain next steps if they perform well
6. Rate their performance for the next round

Be encouraging, professional, and thorough in your evaluation.`;

      default:
        return basePrompt;
    }
  }

  private getFallbackWorkflowResponse(step: string, context: any): GeminiResponse {
    switch (step) {
      case 'tpo_contact':
        return {
          text: `Hello ${context.tpoName}, this is Jerry from the intern management system. I'm calling about the ${context.position} opening. Are you available to discuss sharing this opportunity with your students?`,
          confidence: 0.8
        };
      case 'resume_screening':
        return {
          text: "I've completed the resume screening process. Based on the job requirements, I've identified several qualified candidates for the next round.",
          action: { type: 'shortlist_students', parameters: context },
          confidence: 0.7
        };
      case 'student_interview':
        return {
          text: `Hello ${context.studentName}, this is Jerry calling about the ${context.position} internship. Thank you for your application. I'd like to discuss your background and experience with you.`,
          confidence: 0.8
        };
      default:
        return {
          text: "I'm processing your request. Please hold on while I gather the necessary information.",
          confidence: 0.5
        };
    }
  }
  // Generate intelligent response based on user input and context
  async generateResponse(
    userInput: string,
    context: ConversationContext,
    sessionId: string
  ): Promise<GeminiResponse> {
    try {
      // Get conversation history for this session
      const history = this.conversationHistory.get(sessionId) || [];
      
      // Build comprehensive prompt with context
      const systemPrompt = this.buildSystemPrompt(context);
      const conversationPrompt = this.buildConversationPrompt(userInput, history, context);
      
      // Call Gemini API
      const response = await this.callGeminiAPI(systemPrompt, conversationPrompt);
      
      // Update conversation history
      history.push(`User: ${userInput}`);
      history.push(`Assistant: ${response.text}`);
      this.conversationHistory.set(sessionId, history.slice(-10)); // Keep last 10 exchanges
      
      return response;
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.getFallbackResponse(userInput, context);
    }
  }

  private buildSystemPrompt(context: ConversationContext): string {
    return `You are Jerry, an AI assistant for an Intern Management System. You are currently on a call with a ${context.contactType} named ${context.contactName}.

Your role is to:
1. Help manage student profiles and applications
2. Provide information about job descriptions and requirements
3. Schedule meetings and send forms when requested
4. Maintain a professional, helpful tone
5. Keep responses concise and actionable
6. Handle the complete automated workflow from TPO contact to student interviews
7. Evaluate resumes and conduct telephonic interviews
8. Schedule Microsoft Teams meetings and send invitations

Available Actions:
- send_jotform: Send application form to contact
- schedule_meeting: Schedule a meeting with mentor
- get_student_info: Retrieve student profile information
- get_job_info: Get job description details
- end_call: End the current call
- evaluate_resume: Screen student resumes against job requirements
- schedule_teams_meeting: Schedule Microsoft Teams interview
- shortlist_students: Create shortlist with evaluation reasons

Context Information:
- Contact Type: ${context.contactType}
- Contact Name: ${context.contactName}
- Available Students: ${context.systemContext.availableStudents.length}
- Available Jobs: ${context.systemContext.availableJobs.length}

Guidelines:
- Always be professional and courteous
- Provide specific, actionable information
- Ask clarifying questions when needed
- Suggest relevant actions based on the conversation
- Keep responses under 100 words for voice delivery
- Act as Jerry, the automated workflow agent
- Handle all aspects of the intern management process`;
  }

  private buildConversationPrompt(
    userInput: string,
    history: string[],
    context: ConversationContext
  ): string {
    const historyText = history.length > 0 ? 
      `\nConversation History:\n${history.join('\n')}\n` : '';
    
    return `${historyText}
Current User Input: "${userInput}"

Please provide a helpful response and suggest any relevant actions. If the user is asking about:
- Student information: Offer to retrieve specific student details
- Job descriptions: Provide job information or requirements
- Applications: Suggest sending JotForm or scheduling meetings
- General queries: Provide informative responses about the intern management process

Response should be natural and conversational for voice delivery.`;
  }

  // Call Gemini API
  private async callGeminiAPI(
    systemPrompt: string,
    conversationPrompt: string
  ): Promise<GeminiResponse> {
    try {
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
                    text: `${systemPrompt}\n\n${conversationPrompt}`
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
      
      // Parse the response to extract actions if any
      const parsedResponse = this.parseGeminiResponse(generatedText, conversationPrompt);
      
      return parsedResponse;
    } catch (error) {
      console.error('Gemini API call failed:', error);
      // Fallback to mock response
      const fullPrompt = `${systemPrompt}\n\n${conversationPrompt}`;
      return this.generateMockResponse(fullPrompt);
    }
  }

  // Parse Gemini response to extract actions and format response
  private parseGeminiResponse(text: string, originalPrompt: string): GeminiResponse {
    const lowerText = text.toLowerCase();
    const lowerPrompt = originalPrompt.toLowerCase();
    
    let action: GeminiResponse['action'] = undefined;
    let confidence = 0.9;
    
    // Detect actions based on response content and original prompt
    if (lowerText.includes('send') && (lowerText.includes('form') || lowerText.includes('jotform'))) {
      action = {
        type: 'send_jotform',
        parameters: {}
      };
    } else if (lowerText.includes('schedule') && lowerText.includes('meeting')) {
      action = {
        type: 'schedule_meeting',
        parameters: {}
      };
    } else if (lowerText.includes('schedule') && lowerText.includes('teams')) {
      action = {
        type: 'schedule_teams_meeting',
        parameters: {}
      };
    } else if (lowerText.includes('evaluate') || lowerText.includes('screen')) {
      action = {
        type: 'evaluate_resume',
        parameters: {}
      };
    } else if (lowerText.includes('shortlist')) {
      action = {
        type: 'shortlist_students',
        parameters: {}
      };
    } else if (lowerPrompt.includes('student') && (lowerPrompt.includes('profile') || lowerPrompt.includes('information'))) {
      action = {
        type: 'get_student_info',
        parameters: {}
      };
    } else if (lowerPrompt.includes('job') && (lowerPrompt.includes('description') || lowerPrompt.includes('position'))) {
      action = {
        type: 'get_job_info',
        parameters: {}
      };
    } else if (lowerText.includes('end') && lowerText.includes('call')) {
      action = {
        type: 'end_call',
        parameters: {}
      };
    }
    
    // Clean up the response text for TTS
    const cleanText = text
      .replace(/\*\*/g, '') // Remove markdown bold
      .replace(/\*/g, '') // Remove markdown italic
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/\n{2,}/g, '\n') // Replace multiple newlines with single
      .trim();
    
    return {
      text: cleanText,
      action,
      confidence
    };
  }

  private generateMockResponse(prompt: string): GeminiResponse {
    const lowerPrompt = prompt.toLowerCase();
    
    // Student information queries
    if (lowerPrompt.includes('student') && (lowerPrompt.includes('profile') || lowerPrompt.includes('information'))) {
      return {
        text: "I can help you with student profile information. Could you please specify which student you'd like to know about? I can provide details about their academic background, skills, and application status.",
        action: {
          type: 'get_student_info',
          parameters: {}
        },
        confidence: 0.9
      };
    }

    // Job description queries
    if (lowerPrompt.includes('job') && (lowerPrompt.includes('description') || lowerPrompt.includes('position'))) {
      return {
        text: "I can provide information about our available job positions. We currently have several internship opportunities across different domains. Would you like me to share details about specific positions or all available roles?",
        action: {
          type: 'get_job_info',
          parameters: {}
        },
        confidence: 0.9
      };
    }

    // Meeting scheduling
    if (lowerPrompt.includes('schedule') && lowerPrompt.includes('meeting')) {
      return {
        text: "I'd be happy to help you schedule a meeting. Please provide the student name and your preferred date and time. I'll coordinate with our mentors and send you a Teams meeting invite.",
        action: {
          type: 'schedule_meeting',
          parameters: {}
        },
        confidence: 0.85
      };
    }

    // Form sending
    if (lowerPrompt.includes('send') && (lowerPrompt.includes('form') || lowerPrompt.includes('jotform'))) {
      return {
        text: "I'll send the application form to your contact information right away. You'll receive it via both email and SMS. The form includes all necessary fields for the internship application process.",
        action: {
          type: 'send_jotform',
          parameters: {}
        },
        confidence: 0.95
      };
    }

    // Application status
    if (lowerPrompt.includes('status') || lowerPrompt.includes('application')) {
      return {
        text: "I can check the application status for you. Our system tracks all applications in real-time. Students can be in active, shortlisted, selected, or other status categories. Which specific application would you like me to check?",
        confidence: 0.8
      };
    }

    // Requirements and eligibility
    if (lowerPrompt.includes('requirement') || lowerPrompt.includes('eligibility')) {
      return {
        text: "Our internship requirements vary by position, but generally include academic performance, relevant skills, and project experience. I can provide specific requirements for any position you're interested in. Which role would you like to know about?",
        confidence: 0.8
      };
    }

    // End call
    if (lowerPrompt.includes('end') && lowerPrompt.includes('call')) {
      return {
        text: "Thank you for using our intern management system. I hope I was able to assist you effectively. Have a great day, and feel free to call again if you need any further assistance!",
        action: {
          type: 'end_call',
          parameters: {}
        },
        confidence: 0.95
      };
    }

    // Default intelligent response
    return {
      text: `I understand you mentioned: "${prompt.split('Current User Input: "')[1]?.split('"')[0] || 'your query'}". I'm here to help with student management, job descriptions, meeting scheduling, and application processes. Could you please provide more specific details about what you'd like assistance with?`,
      confidence: 0.6
    };
  }

  private getFallbackResponse(userInput: string, context: ConversationContext): GeminiResponse {
    return {
      text: "I apologize, but I'm experiencing some technical difficulties. However, I'm still here to help you with student management, job descriptions, or scheduling. Could you please repeat your request?",
      confidence: 0.3
    };
  }

  // Clear conversation history for a session
  clearConversationHistory(sessionId: string): void {
    this.conversationHistory.delete(sessionId);
  }

  // Get conversation history for a session
  getConversationHistory(sessionId: string): string[] {
    return this.conversationHistory.get(sessionId) || [];
  }

  // Update configuration
  updateConfig(newConfig: Partial<GeminiConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Singleton instance
export const geminiService = new GeminiService();