// Text-to-Speech Service using Web Speech API
export interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: string;
  lang?: string;
}

class TTSService {
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private defaultOptions: TTSOptions = {
    rate: 0.8,
    pitch: 1,
    volume: 1,
    lang: 'en-US',
  };

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();
    
    // Handle voice loading
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices(): void {
    this.voices = this.synthesis.getVoices();
    console.log(`Loaded ${this.voices.length} TTS voices`);
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(voice => voice.lang.startsWith('en'));
  }

  speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!text.trim()) {
        reject(new Error('No text to speak'));
        return;
      }

      // Stop any current speech
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      const finalOptions = { ...this.defaultOptions, ...options };

      // Set utterance properties
      utterance.rate = finalOptions.rate || 0.8;
      utterance.pitch = finalOptions.pitch || 1;
      utterance.volume = finalOptions.volume || 1;
      utterance.lang = finalOptions.lang || 'en-US';

      // Find and set voice
      if (finalOptions.voice) {
        const selectedVoice = this.voices.find(voice => 
          voice.name === finalOptions.voice || voice.voiceURI === finalOptions.voice
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      } else {
        // Use first available English voice
        const englishVoice = this.voices.find(voice => voice.lang.startsWith('en'));
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }

      // Set event handlers
      utterance.onend = () => {
        console.log('Speech synthesis completed');
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        reject(new Error(`Speech synthesis failed: ${event.error}`));
      };

      utterance.onstart = () => {
        console.log('Speech synthesis started');
      };

      // Speak the text
      this.synthesis.speak(utterance);
    });
  }

  stop(): void {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
  }

  pause(): void {
    if (this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
    }
  }

  resume(): void {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  isPaused(): boolean {
    return this.synthesis.paused;
  }

  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }
}

export const ttsService = new TTSService();
