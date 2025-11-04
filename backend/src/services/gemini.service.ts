import { AIStudentContext, AIResponse } from '../types';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class GeminiService {
  private apiKey: string;
  private baseURL = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'your_gemini_api_key_here') {
      throw new Error('GEMINI_API_KEY not set in environment. Get one from https://aistudio.google.com/apikey');
    }
    this.apiKey = key;
    console.log('[OK] Gemini API initialized with key:', this.apiKey.substring(0, 10) + '...');
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate AI student response based on user's teaching input
   */
  async generateResponse(
    userInput: string,
    context: AIStudentContext,
    conversationHistory?: Array<{ role: 'student' | 'ai_student'; message: string }>
  ): Promise<AIResponse> {
    const systemPrompt = this.buildSystemPrompt(context);

    try {
      // Using gemini-2.0-flash-exp - experimental but works
      const modelName = 'gemini-2.0-flash-exp';
      console.log(`[AI] Calling Gemini API: ${this.baseURL}/models/${modelName}:generateContent`);

      // Build conversation history for context
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      if (conversationHistory && conversationHistory.length > 0) {
        // Add last messages for context (max 12 messages = 6 exchanges)
        // This provides better context without exceeding token limits
        const recentHistory = conversationHistory.slice(-12);
        for (const msg of recentHistory) {
          contents.push({
            role: msg.role === 'student' ? 'user' : 'model',
            parts: [{ text: msg.message }]
          });
        }
      }

      // Add current user message
      contents.push({
        role: 'user',
        parts: [
          {
            text: `Ученикът ти обяснява: "${userInput}"\n\nОтговори като AI-ученик:`,
          },
        ],
      });

      const requestBody = {
        systemInstruction: {
          parts: [{
            text: systemPrompt
          }]
        },
        contents,
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 200,
          topP: 0.9,
          topK: 40,
        },
      };

      console.log('[REQ] Request body:', JSON.stringify(requestBody, null, 2).substring(0, 500) + '...');

      // Retry logic with exponential backoff (reduced retries for faster fallback)
      const MAX_RETRIES = 2;
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          // Add timeout to fetch request (10 seconds)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const response = await fetch(
            `${this.baseURL}/models/${modelName}:generateContent?key=${this.apiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
              signal: controller.signal,
            }
          );

          clearTimeout(timeoutId);

          // Handle rate limiting (429)
          if (response.status === 429) {
            const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            console.warn(`[WARN] Rate limited. Waiting ${waitTime}ms before retry ${attempt}/${MAX_RETRIES}`);
            await this.sleep(waitTime);
            continue;
          }

          // Handle server errors (5xx) - retry
          if (response.status >= 500) {
            const waitTime = 1000 * attempt; // 1s, 2s, 3s
            console.warn(`[WARN] Server error ${response.status}. Retrying ${attempt}/${MAX_RETRIES}...`);
            await this.sleep(waitTime);
            continue;
          }

          // Other errors - don't retry
          if (!response.ok) {
            const errorBody = await response.text();
            console.error('[ERR] Gemini API Error Response:', errorBody);
            throw new Error(`Gemini API error: ${response.statusText} - ${errorBody}`);
          }

          const data = await response.json() as GeminiResponse;

          // Check if we got a valid response
          if (!data.candidates || data.candidates.length === 0) {
            console.error('[ERR] No candidates in Gemini response:', JSON.stringify(data));
            throw new Error('No response from Gemini API');
          }

          let aiMessage = data.candidates[0]?.content?.parts[0]?.text || 'Хм... не разбрах.';

          // Validate response: not too long (max 300 chars)
          if (aiMessage.length > 300) {
            console.warn('[WARN] AI response too long, truncating');
            aiMessage = aiMessage.substring(0, 297) + '...';
          }

          // Validate: no AI assistant phrases
          const aiPhrases = ['разбира се', 'със сигорност', 'нека да', 'бих искал', 'може да'];
          const lowerMessage = aiMessage.toLowerCase();
          if (aiPhrases.some(phrase => lowerMessage.includes(phrase))) {
            console.warn('[WARN] AI used assistant phrases, response may not sound like student');
          }

          return this.parseResponse(aiMessage, context);

        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown error');

          // Check if it's a timeout error
          if (error instanceof Error && error.name === 'AbortError') {
            console.error(`[ERR] Attempt ${attempt}/${MAX_RETRIES} timed out after 10s`);
            lastError = new Error('Gemini API timeout');
          } else {
            console.error(`[ERR] Attempt ${attempt}/${MAX_RETRIES} failed:`, error);
          }

          // If not the last attempt, wait before retry
          if (attempt < MAX_RETRIES) {
            const waitTime = 1000 * attempt;
            await this.sleep(waitTime);
          }
        }
      }

      // All retries failed
      console.error(`[ERR] All ${MAX_RETRIES} attempts failed`);
      throw new Error(`Failed after ${MAX_RETRIES} attempts: ${lastError?.message}`);
    } catch (error) {
      console.error('[ERR] Gemini API error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * Build the system prompt that defines AI student personality
   */
  private buildSystemPrompt(context: AIStudentContext): string {
    const { name, level, knownConcepts, partialConcepts, currentTopic, personalityTraits } =
      context;

    const levelDescriptions = [
      'абсолютен начинаещ - не знаеш почти нищо за програмиране',
      'начинаещ - знаеш малко основи',
      'напреднал начинаещ - разбираш базови концепции',
      'средно ниво - можеш да пишеш прост код',
      'напреднал - разбираш по-сложни концепции',
    ];

    return `Ти си Bulgarian ученик на име ${name}, който се учи на JavaScript.

ТЕКУЩО НИВО: ${level} - ${levelDescriptions[level] || levelDescriptions[0]}

ЛИЧНОСТ:
- Любопитство: ${personalityTraits.curiosity} (колко често задаваш въпроси)
- Объркване: ${personalityTraits.confusionRate} (колко лесно се бъркаш)
- Скорост на учене: ${personalityTraits.learningSpeed}

ВЕЧ ЗНАЕШ: ${knownConcepts.length > 0 ? knownConcepts.join(', ') : 'почти нищо още'}
ЧАСТИЧНО РАЗБИРАШ: ${partialConcepts.length > 0 ? partialConcepts.join(', ') : 'нищо засега'}

ТЕКУЩА ТЕМА: ${currentTopic}

ПРАВИЛА КАК ДА СЕ ДЪРЖИШ (ЗАДЪЛЖИТЕЛНО!):
1. Отговаряй КРАТКО - максимум 1-2 изречения
2. Говори разговорно на български, като истински ученик
3. Прави грешки типични за ниво ${level}
4. Ако не разбираш - питай уточняващи въпроси
5. Покажи ентусиазъм когато научиш нещо: "Ааа!", "Супер!", "Ясно!"
6. Понякога бъркай подобни неща
7. НЕ ПИШИ код в отговорите си - само говори за него
8. НЕ използвай AI фрази като "Разбира се", "Със сигурност", "Нека"

ПРИМЕРНИ ОТГОВОРИ ЗА НИВО ${level}:
${this.getExampleResponsesForLevel(level)}

Отговаряй като истински ученик, НЕ като AI асистент!`;
  }

  /**
   * Get example responses based on student level
   */
  private getExampleResponsesForLevel(level: number): string {
    const examples = [
      // Level 0
      `- "Ъъъ... това let нещо е за какво точно?"
- "Чакай, не разбрах... може ли пример?"
- "console.log-a принтира ли неща?"`,
      // Level 1
      `- "Ааа! Значи let е за променливи, нали?"
- "Окей, мисля че схванах... let x = 5 прави променлива?"
- "А защо не мога да ползвам var?"`,
      // Level 2
      `- "Супер! Значи const е за константи които не се променят!"
- "А let може да се променя после, така ли?"
- "Разбрах разликата!"`,
    ];

    return examples[Math.min(level, examples.length - 1)];
  }

  /**
   * Parse AI response and extract metadata
   */
  private parseResponse(message: string, context: AIStudentContext): AIResponse {
    // Detect emotion from message with expanded patterns
    let emotion: AIResponse['emotion'] = 'neutral';
    const lowerMsg = message.toLowerCase();

    // Confused patterns
    if (
      /не разбирам|не разбрах|объркан|объркана|какво значи|не знам|хъ\?|ъъъ/.test(lowerMsg)
    ) {
      emotion = 'confused';
    }
    // Excited patterns (check before understanding to prioritize higher emotion)
    else if (
      /ааа+!|супер!|страхотно!|уау|wow|готино|яко|перфектно|разбрах!/.test(lowerMsg)
    ) {
      emotion = 'excited';
    }
    // Understanding patterns
    else if (
      /ааа[,\s]|разбрах[,\.\s]|ясно|окей|добре|схванах|сетих се|aha|got it/.test(lowerMsg)
    ) {
      emotion = 'understanding';
    }

    // Dynamic understanding delta based on emotion
    const understandingDelta = {
      'excited': 0.15,      // Big "Aha!" moment
      'understanding': 0.1,  // Regular understanding
      'neutral': 0.03,       // Just listening/processing
      'confused': -0.05      // Confusion decreases understanding
    }[emotion] || 0;

    // Should ask question if confused or curious
    const shouldAskQuestion =
      emotion === 'confused' || message.includes('?') || Math.random() < context.personalityTraits.curiosity;

    return {
      message: message.trim(),
      emotion,
      understandingDelta,
      shouldAskQuestion,
    };
  }
}
