// Web Speech API interface definitions
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => ISpeechRecognition;
    webkitSpeechRecognition?: new () => ISpeechRecognition;
  }
}

export class SpeechService {
  private recognition: ISpeechRecognition | null = null;
  public isSupported: boolean = false;

  constructor() {
    const SpeechConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechConstructor) {
      this.isSupported = true;
      try {
        this.recognition = new SpeechConstructor();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        // Default to Bengali (Bangladesh) with fallback capability
        this.recognition.lang = 'bn-BD';
      } catch (e) {
        console.warn('SpeechRecognition initialization error:', e);
        this.isSupported = false;
      }
    }
  }

  startListening(
    onResult: (transcript: string) => void,
    onError: (error: string) => void,
    onEnd: () => void,
    lang: string = 'bn-BD'
  ) {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser.');
      return;
    }

    this.recognition.lang = lang;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      onError(event.error);
    };

    this.recognition.onend = () => {
      onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition start failed:', e);
      onError('Microphone busy or already active.');
    }
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}

export const speechService = new SpeechService();
