import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

// Web Speech API types
interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => ISpeechRecognition;
    webkitSpeechRecognition?: new () => ISpeechRecognition;
  }
}

function MessageInput({ onSend, disabled }: MessageInputProps) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'bg-BG'; // Bulgarian language
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setInput((prev) => prev + (prev ? ' ' : '') + transcript);
          } else {
            interimTranscript += transcript;
          }
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert(t('session.voiceNotSupported'));
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`border-t px-4 py-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="max-w-4xl mx-auto flex items-end space-x-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('session.inputPlaceholder')}
          disabled={disabled}
          rows={3}
          className={`flex-1 resize-none px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed ${
            isDark
              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 disabled:bg-gray-800 disabled:text-gray-500'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:text-gray-400'
          }`}
        />

        <button
          onClick={handleVoiceInput}
          disabled={disabled}
          className={`px-4 py-3 rounded-xl transition duration-200 ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : isDark
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          } disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50`}
          title={isListening ? t('session.listening') : t('session.microphone')}
        >
          {isListening ? t('session.listening') : t('session.microphone')}
        </button>

        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:opacity-50 text-white font-medium rounded-xl transition duration-200"
        >
          {t('session.send')}
        </button>
      </div>
      <div className="max-w-4xl mx-auto mt-2">
        <p className={`text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {t('session.tipText')}
        </p>
      </div>
    </div>
  );
}

export default MessageInput;
