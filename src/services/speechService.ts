// Speech Service for TTS and STT functionality
export class SpeechService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private isListening = false;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeSpeechRecognition();
    this.loadVoices();
  }

  private initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;
    }
  }

  private loadVoices() {
    const loadVoicesWhenAvailable = () => {
      this.voices = this.synthesis.getVoices();
      if (this.voices.length === 0) {
        setTimeout(loadVoicesWhenAvailable, 100);
      }
    };
    
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = loadVoicesWhenAvailable;
    }
    loadVoicesWhenAvailable();
  }

  // Text-to-Speech functionality
  speak(text: string, options: {
    voice?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
  } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!text.trim()) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice
      if (options.voice) {
        const selectedVoice = this.voices.find(voice => 
          voice.name === options.voice
        ) || this.voices.find(voice => 
          voice.name.toLowerCase().includes(options.voice!.toLowerCase())
        ) || this.voices.find(voice => 
          voice.lang.includes(options.voice!)
        );
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      } else {
        // Default to a professional English voice
        const defaultVoice = this.voices.find(voice => 
          voice.lang.startsWith('en') && (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('samantha'))
        ) || this.voices.find(voice => 
          voice.lang.startsWith('en') && voice.name.toLowerCase().includes('google')
        ) || this.voices.find(voice => voice.lang.startsWith('en'));
        
        if (defaultVoice) {
          utterance.voice = defaultVoice;
        }
      }

      // Set speech parameters
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 0.8;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      // Small delay to ensure proper voice loading
      setTimeout(() => {
        this.synthesis.speak(utterance);
      }, 100);
    });
  }

  // Speech-to-Text functionality
  startListening(callbacks: {
    onResult?: (transcript: string, isFinal: boolean) => void;
    onError?: (error: string) => void;
    onStart?: () => void;
    onEnd?: () => void;
  } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }

      this.isListening = true;

      this.recognition.onstart = () => {
        callbacks.onStart?.();
        resolve();
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          callbacks.onResult?.(finalTranscript, true);
        } else if (interimTranscript) {
          callbacks.onResult?.(interimTranscript, false);
        }
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        callbacks.onError?.(event.error);
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        this.isListening = false;
        callbacks.onEnd?.();
      };

      this.recognition.start();
    });
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  stopSpeaking(): void {
    this.synthesis.cancel();
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  isCurrentlySpeaking(): boolean {
    return this.synthesis.speaking;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }
}

// Singleton instance
export const speechService = new SpeechService();