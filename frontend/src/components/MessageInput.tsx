import { useState, KeyboardEvent, useRef, useEffect } from 'react';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'bg-BG'; // Bulgarian language
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
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

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Браузърът не поддържа гласово подаване');
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
    <div className="bg-white border-t border-gray-200 px-4 py-4">
      <div className="max-w-4xl mx-auto flex items-end space-x-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Обясни концепцията на AI ученика..."
          disabled={disabled}
          rows={3}
          className="flex-1 resize-none px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />

        <button
          onClick={handleVoiceInput}
          disabled={disabled}
          className={`px-4 py-3 rounded-xl transition duration-200 flex items-center justify-center ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          } disabled:bg-gray-100 disabled:cursor-not-allowed`}
          title={isListening ? 'Слушам...' : 'Микрофон'}
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 16.91c-1.48 1.46-3.51 2.36-5.71 2.36-2.2 0-4.23-.9-5.71-2.36m9.42-9.42C15.51 4.35 13.92 3 12 3s-3.51 1.35-4.71 2.49M3 9.5h2v2H3zm18 0h2v2h-2z" />
          </svg>
        </button>

        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-xl transition duration-200 flex items-center space-x-2"
        >
          <span>Изпрати</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
      <div className="max-w-4xl mx-auto mt-2">
        <p className="text-xs text-gray-500 text-center">
          Съвет: Обяснявай със примери и питай дали AI ученикът разбра
        </p>
      </div>
    </div>
  );
}

export default MessageInput;
