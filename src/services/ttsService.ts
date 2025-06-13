export interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: string; 
  lang?: string; 
}

class TTSService {
  private audio: HTMLAudioElement | null = null;
  private sourceObjectURL: string | null = null;
  private is_playing = false;
  private is_paused = false;
  
  private readonly apiKey = import.meta.env.VITE_TSS_API_KEY;
  private readonly defaultVoiceId = 'EXAVITQu4vr4xnSDxMaL';
  private readonly endpoint = 'https://api.elevenlabs.io/v1/text-to-speech/';
  private readonly defaultOptions: TTSOptions = {
    rate: 0.8,
    pitch: 1,
    volume: 1,
    lang: 'ar',
  };

  isSupported(): boolean {
    return typeof window !== 'undefined' && !!window.Audio && !!window.fetch;
  }

  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (!text.trim()) throw new Error('No text to speak');
    this.stop();

    const opts = {...this.defaultOptions, ...options};
    let voiceId = opts.voice || this.defaultVoiceId;
    let modelId = 'eleven_multilingual_v2';

    const body = {
      text,
      model_id: modelId,
      voice_settings: {
        stability: 0.4,
        similarity_boost: 0.75
      }
    };

    const response = await fetch(`${this.endpoint}${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error('Failed to synthesize speech via ElevenLabs: ' + response.statusText);
    }
    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);

    this.cleanupAudio(); 
    this.audio = new Audio(audioUrl);
    this.sourceObjectURL = audioUrl;

    if (typeof opts.volume === 'number') this.audio.volume = opts.volume;

    this.is_paused = false;
    this.is_playing = true;

    return new Promise<void>((resolve, reject) => {
      if (!this.audio) {
        reject(new Error('Audio element did not initialize properly'));
        return;
      }
      this.audio.onended = () => {
        this.is_playing = false;
        this.is_paused = false;
        this.cleanupAudio();
        resolve();
      };
      this.audio.onerror = e => {
        this.is_playing = false;
        this.cleanupAudio();
        reject(new Error('Audio playback error'));
      };
      this.audio.play().catch(reject);
    });
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.is_playing = false;
      this.is_paused = false;
      this.cleanupAudio();
    }
  }

  pause(): void {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
      this.is_paused = true;
      this.is_playing = false;
    }
  }

  resume(): void {
    if (this.audio && this.is_paused) {
      this.audio.play();
      this.is_paused = false;
      this.is_playing = true;
    }
  }

  isSpeaking(): boolean {
    return !!this.audio && this.is_playing;
  }

  isPaused(): boolean {
    return !!this.audio && this.is_paused;
  }

  private cleanupAudio() {
    if (this.audio) {
      this.audio.onended = null;
      this.audio.onerror = null;
      this.audio.src = '';
      this.audio = null;
    }
    if (this.sourceObjectURL) {
      URL.revokeObjectURL(this.sourceObjectURL);
      this.sourceObjectURL = null;
    }
  }
}

export const ttsService = new TTSService();