import { AIStudentContext, AIResponse } from '../types';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts?: Array<{
        text: string;
      }>;
      role?: string;
    };
    finishReason?: string;
    index?: number;
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
    conversationHistory?: Array<{ role: 'student' | 'ai_student'; message: string }>,
    language: string = 'bg' // Default to Bulgarian
  ): Promise<AIResponse> {
    const systemPrompt = this.buildSystemPrompt(context, language);

    try {
      // Using gemini-2.5-flash - stable and fast model
      const modelName = 'gemini-2.5-flash';
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

      // Add current user message (language-aware)
      const userPrompt = language === 'en'
        ? `The teacher is explaining: "${userInput}"\n\nRespond as an AI student:`
        : `Ученикът ти обяснява: "${userInput}"\n\nОтговори като AI-ученик:`;

      contents.push({
        role: 'user',
        parts: [
          {
            text: userPrompt,
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
          maxOutputTokens: 1000, // Increased to 1000 to handle reasoning + actual response
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

          console.log('[DEBUG] Gemini response:', JSON.stringify(data).substring(0, 500));

          // Check if we got a valid response
          if (!data.candidates || data.candidates.length === 0) {
            console.error('[ERR] No candidates in Gemini response:', JSON.stringify(data));
            throw new Error('No response from Gemini API');
          }

          // Safely extract message with multiple fallbacks
          const candidate = data.candidates[0];

          // Check for MAX_TOKENS finish reason (no parts generated)
          if (candidate.finishReason === 'MAX_TOKENS' && (!candidate.content.parts || candidate.content.parts.length === 0)) {
            console.error('[ERR] Response stopped due to MAX_TOKENS, no content generated');
            throw new Error('Gemini response truncated due to token limit');
          }

          if (!candidate || !candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
            console.error('[ERR] Invalid candidate structure:', JSON.stringify(candidate));
            throw new Error('Invalid response structure from Gemini API');
          }

          let aiMessage = candidate.content.parts[0].text || 'Хм... не разбрах.';

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
  private buildSystemPrompt(context: AIStudentContext, language: string = 'bg'): string {
    const { name, level, knownConcepts, partialConcepts, currentTopic, currentTopicUnderstanding, personalityTraits } =
      context;

    if (language === 'en') {
      // English system prompt
      const levelDescriptions = [
        'absolute beginner - you know almost nothing about programming',
        'beginner - you know a few basics',
        'advanced beginner - you understand basic concepts',
        'intermediate - you can write simple code',
        'advanced - you understand more complex concepts',
      ];

      return `You are a student named ${name} learning JavaScript.

CURRENT LEVEL: ${level} - ${levelDescriptions[level] || levelDescriptions[0]}

PERSONALITY:
- Curiosity: ${personalityTraits.curiosity} (how often you ask questions)
- Confusion rate: ${personalityTraits.confusionRate} (how easily you get confused)
- Learning speed: ${personalityTraits.learningSpeed}

ALREADY KNOW: ${knownConcepts.length > 0 ? knownConcepts.join(', ') : 'almost nothing yet'}
PARTIALLY UNDERSTAND: ${partialConcepts.length > 0 ? partialConcepts.join(', ') : 'nothing yet'}

CURRENT TOPIC: ${currentTopic}
YOUR UNDERSTANDING OF THE TOPIC: ${Math.round((currentTopicUnderstanding || 0) * 100)}%

BEHAVIOR RULES (MANDATORY!):
1. Answer BRIEFLY - maximum 1-2 sentences
2. Speak casually in English, like a real student
3. Make mistakes typical for level ${level}
4. If you don't understand - ask clarifying questions ONLY about what the teacher is explaining NOW
5. Show enthusiasm when you learn something: "Ohh!", "Cool!", "Got it!"
6. Sometimes confuse similar things
7. DON'T WRITE code in your answers - just talk about it
8. DON'T use AI phrases like "Certainly", "Of course", "Let's"
9. DON'T mention concepts the teacher HASN'T explained - don't invent topics yourself
10. IMPORTANT: If your understanding reaches 95% or more, tell the teacher that you've understood everything about the topic and suggest ending the session! For example: "Awesome! I think I understand everything about ${currentTopic} now! Should we end the session?"

EXAMPLE RESPONSES FOR LEVEL ${level}:
${this.getExampleResponsesForLevel(level, 'en')}

Respond like a real student, NOT like an AI assistant!`;
    }

    // Bulgarian system prompt (default)
    const levelDescriptions = [
      'абсолютен начинаещ - не знаеш почти нищо за програмиране',
      'начинаещ - знаеш малко основи',
      'напреднал начинаещ - разбираш базови концепции',
      'средно ниво - можеш да пишеш прост код',
      'напреднал - разбираш по-сложни концепции',
    ];

    return `Ти си ученик на име ${name}, който се учи на JavaScript.

ТЕКУЩО НИВО: ${level} - ${levelDescriptions[level] || levelDescriptions[0]}

ЛИЧНОСТ:
- Любопитство: ${personalityTraits.curiosity} (колко често задаваш въпроси)
- Объркване: ${personalityTraits.confusionRate} (колко лесно се бъркаш)
- Скорост на учене: ${personalityTraits.learningSpeed}

ВЕЧ ЗНАЕШ: ${knownConcepts.length > 0 ? knownConcepts.join(', ') : 'почти нищо още'}
ЧАСТИЧНО РАЗБИРАШ: ${partialConcepts.length > 0 ? partialConcepts.join(', ') : 'нищо засега'}

ТЕКУЩА ТЕМА: ${currentTopic}
ТВОЕТО РАЗБИРАНЕ НА ТЕМАТА: ${Math.round((currentTopicUnderstanding || 0) * 100)}%

ПРАВИЛА КАК ДА СЕ ДЪРЖИШ (ЗАДЪЛЖИТЕЛНО!):
1. Отговаряй КРАТКО - максимум 1-2 изречения
2. Говори разговорно на български, като истински ученик
3. Прави грешки типични за ниво ${level}
4. Ако не разбираш - питай уточняващи въпроси САМО за това което ученикът обяснява СЕГА
5. Покажи ентусиазъм когато научиш нещо: "Ааа!", "Супер!", "Ясно!"
6. Понякога бъркай подобни неща
7. НЕ ПИШИ код в отговорите си - само говори за него
8. НЕ използвай AI фрази като "Разбира се", "Със сигурност", "Нека"
9. НЕ споменавай концепции които ученикът НЕ е обяснил - не измисляй теми сам
10. ВАЖНО: Ако твоето разбиране достигне 95% или повече, кажи на ученика че вече си разбрал/а всичко за темата и предложи да приключите сесията! Например: "Супер! Мисля че вече разбирам всичко за ${currentTopic}! Да приключим ли сесията?"

ПРИМЕРНИ ОТГОВОРИ ЗА НИВО ${level}:
${this.getExampleResponsesForLevel(level, 'bg')}

Отговаряй като истински ученик, НЕ като AI асистент!`;
  }

  /**
   * Get example responses based on student level
   */
  private getExampleResponsesForLevel(level: number, language: string = 'bg'): string {
    if (language === 'en') {
      const examples = [
        // Level 0
        `- "Uhh... I didn't get that, can you explain again?"
- "Wait, this is really confusing... can I get an example?"
- "I don't know what that means."`,
        // Level 1
        `- "Ohh! I think I got the idea!"
- "Okay, so this works like this, right?"
- "Are there other ways to do it?"`,
        // Level 2
        `- "Cool! I understand how it works!"
- "Can it be used differently?"
- "Got it, I see the connection now!"`,
        // Level 3+
        `- "Interesting! How does this connect to other things I know?"
- "There was a case where... how should I use it there?"
- "This reminds me of something... the difference is that...?"`,
      ];
      return examples[Math.min(level, examples.length - 1)];
    }

    // Bulgarian examples (default)
    const examples = [
      // Level 0
      `- "Ъъъ... не разбрах, може ли да обясниш още веднъж?"
- "Чакай, това е много объркващо... може ли пример?"
- "Не знам какво значи това."`,
      // Level 1
      `- "Ааа! Мисля че схванах идеята!"
- "Окей, значи това работи така, нали?"
- "Има ли други начини да се направи?"`,
      // Level 2
      `- "Супер! Разбрах как работи!"
- "А може ли да се използва по различен начин?"
- "Ясно, сега схванах връзката!"`,
      // Level 3+
      `- "Интересно! А как се свързва с другите неща които знам?"
- "Имаше случай където... как трябва да го използвам там?"
- "Това ми напомня за нещо... разликата е че...?"`,
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
    // Understanding patterns (expanded to catch more cases)
    else if (
      /ааа[,\s]|разбрах[,\.\s]|ясно|окей|добре|схванах|сетих се|aha|got it|може|значи|това е|основно|замяст|return/.test(lowerMsg)
    ) {
      emotion = 'understanding';
    }

    // Dynamic understanding delta based on emotion
    const understandingDelta = {
      'excited': 0.15,      // Big "Aha!" moment (15% - gives 10 XP)
      'understanding': 0.10, // Regular understanding (10% - gives 5 XP)
      'neutral': 0.05,       // Just listening/processing (5% - gives 2 XP)
      'confused': -0.05      // Confusion decreases understanding (no XP)
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
