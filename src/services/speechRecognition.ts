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
    const SpeechConstructor =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;
    this.isSupported = Boolean(SpeechConstructor);
  }

  startListening(
    onResult: (transcript: string) => void,
    onError: (error: string) => void,
    onEnd: () => void,
    lang: string = 'bn-BD'
  ) {
    const SpeechConstructor =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;

    if (!SpeechConstructor) {
      onError('Speech recognition is not supported in this browser.');
      return;
    }

    // Stop and clean up any active session first
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        // ignore abort errors
      }
      this.recognition = null;
    }

    try {
      const recognition = new SpeechConstructor();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (event.results && event.results.length > 0 && event.results[0].length > 0) {
          const transcript = event.results[0][0].transcript;
          onResult(transcript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        let friendlyMessage = event.error;
        if (event.error === 'no-speech') {
          friendlyMessage = 'কোনো কথা শোনা যায়নি, আবার বলুন।';
        } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          friendlyMessage = 'মাইক্রোফোন ব্যবহারের অনুমতি দিন (Microphone permission required)।';
        } else if (event.error === 'network') {
          friendlyMessage = 'ভয়েস রিকগনিশনের জন্য ইন্টারনেট সংযোগ প্রয়োজন।';
        }
        onError(friendlyMessage);
      };

      recognition.onend = () => {
        this.recognition = null;
        onEnd();
      };

      this.recognition = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Recognition start failed:', e);
      onError('মাইক্রোফোন চালু করা যায়নি। আবার চেষ্টা করুন।');
      this.recognition = null;
      onEnd();
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore stop errors
      }
      this.recognition = null;
    }
  }
}

export const speechService = new SpeechService();
