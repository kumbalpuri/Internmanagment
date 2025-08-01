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
  transcript: any[];
  sessionDuration: number;
}

export interface GeminiResponse {
  response: string;
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

  // Process call interaction with proper error handling
  async processCallInteraction(
    userInput: string,
    context: ConversationContext
  ): Promise<GeminiResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(context);
      const response = await this.callGeminiAPI(systemPrompt, userInput);
      return response;
    } catch (error) {
      console.error('Gemini processing error:', error);
      return this.getFallbackResponse(userInput, context);
    }
  }

  private buildSystemPrompt(context: ConversationContext): string {
    return `You are Jerry, an AI assistant from Solar Industries India Ltd for intern management. You are currently on a call with a ${context.contactType} named ${context.contactName}.

Your role:
1. Help manage student profiles and applications
2. Provide information about job descriptions and requirements
3. Schedule meetings and send forms when requested
4. Maintain a professional, helpful tone
5. Keep responses very short and conversational (1-2 sentences maximum)
6. Suggest relevant actions based on the conversation

Available Actions:
- send_jotform: Send application form to contact
- schedule_meeting: Schedule a meeting with mentor
- get_student_info: Retrieve student profile information
- get_job_info: Get job description details
- end_call: End the current call

Guidelines:
- Always be professional and courteous
- Provide specific, actionable information
- Keep responses under 30 words for voice delivery
- Suggest relevant actions based on the conversation
- Be concise and to the point`;
  }

  private async callGeminiAPI(systemPrompt: string, userInput: string): Promise<GeminiResponse> {
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
                    text: `${systemPrompt}\n\nUser: ${userInput}\n\nProvide a helpful, concise response:`
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
      return this.parseGeminiResponse(generatedText, userInput);
    } catch (error) {
      console.error('Gemini API call failed:', error);
      return this.getFallbackResponse(userInput);
    }
  }

  private parseGeminiResponse(text: string, originalInput: string): GeminiResponse {
    const lowerText = text.toLowerCase();
    const lowerInput = originalInput.toLowerCase();
    
    let action: GeminiResponse['action'] = undefined;
    
    // Detect actions based on response content and input
    if (lowerText.includes('send') && (lowerText.includes('form') || lowerText.includes('jotform'))) {
      action = { type: 'send_jotform', parameters: {} };
    } else if (lowerText.includes('schedule') && lowerText.includes('meeting')) {
      action = { type: 'schedule_meeting', parameters: {} };
    } else if (lowerInput.includes('student') && (lowerInput.includes('profile') || lowerInput.includes('information'))) {
      action = { type: 'get_student_info', parameters: {} };
    } else if (lowerInput.includes('job') && (lowerInput.includes('description') || lowerInput.includes('position'))) {
      action = { type: 'get_job_info', parameters: {} };
    } else if (lowerText.includes('end') && lowerText.includes('call')) {
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

  private getFallbackResponse(userInput: string, context?: ConversationContext): GeminiResponse {
    const lowerInput = userInput.toLowerCase();
    
    // Student information queries
    if (lowerInput.includes('student')) {
      return {
        response: "I can help you with student information. Which student would you like to know about?",
        action: { type: 'get_student_info', parameters: {} },
        confidence: 0.8
      };
    }

    // Job queries
    if (lowerInput.includes('job') || lowerInput.includes('position')) {
      return {
        response: "I can provide information about our available positions. Which job would you like to know about?",
        action: { type: 'get_job_info', parameters: {} },
        confidence: 0.8
      };
    }

    // Form sending
    if (lowerInput.includes('form') || lowerInput.includes('application')) {
      return {
        response: "I'll send the application form to your contact information right away.",
        action: { type: 'send_jotform', parameters: {} },
        confidence: 0.9
      };
    }

    // Meeting scheduling
    if (lowerInput.includes('meeting') || lowerInput.includes('schedule')) {
      return {
        response: "I'd be happy to help you schedule a meeting. Let me coordinate with our mentors.",
        action: { type: 'schedule_meeting', parameters: {} },
        confidence: 0.8
      };
    }

    // Default response
    return {
      response: `I understand. I'm here to help with student management, job descriptions, and scheduling. How can I assist you?`,
      confidence: 0.6
    };
  }

  // Update configuration
  updateConfig(newConfig: Partial<GeminiConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Singleton instance
export const geminiService = new GeminiService();