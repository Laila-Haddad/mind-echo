// LLM Service for text correction and completion
export interface LLMResponse {
  correctedText: string;
  confidence: number;
  originalText: string;
}

class LLMService {
  private apiKey: string = '';
  private baseUrl: string = 'https://api.openai.com/v1/chat/completions';

  setApiKey(key: string): void {
    this.apiKey = key;
  }

  async correctText(rawLetters: string): Promise<LLMResponse> {
    if (!this.apiKey) {
      // Return mock response for development
      return this.getMockCorrection(rawLetters);
    }

    try {
      const prompt = `Correct any errors and complete the following sequence of predicted EEG letters into a coherent English sentence. The letters may contain errors due to EEG signal noise. Return only the corrected sentence without explanations: "${rawLetters}"`;

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an assistant that corrects and completes text sequences derived from EEG brain signals. Be concise and return only the corrected text.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 100,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status}`);
      }

      const data = await response.json();
      const correctedText = data.choices[0]?.message?.content?.trim() || rawLetters;

      return {
        correctedText,
        confidence: 0.85,
        originalText: rawLetters,
      };
    } catch (error) {
      console.error('LLM service error:', error);
      return this.getMockCorrection(rawLetters);
    }
  }

  private getMockCorrection(rawLetters: string): LLMResponse {
    // Simple mock corrections for common patterns
    const corrections: { [key: string]: string } = {
      'HELO': 'HELLO',
      'WRLD': 'WORLD',
      'TH': 'THE',
      'Y': 'YES',
      'N': 'NO',
      'HLP': 'HELP',
      'PLZ': 'PLEASE',
      'THX': 'THANK YOU',
    };

    let corrected = rawLetters;
    Object.entries(corrections).forEach(([pattern, replacement]) => {
      corrected = corrected.replace(new RegExp(pattern, 'gi'), replacement);
    });

    // If the text is too short, try to complete it
    if (corrected.length < 3) {
      corrected = this.completeShortText(corrected);
    }

    return {
      correctedText: corrected,
      confidence: 0.75,
      originalText: rawLetters,
    };
  }

  private completeShortText(text: string): string {
    const completions: { [key: string]: string } = {
      'H': 'HELLO',
      'Y': 'YES',
      'N': 'NO',
      'T': 'THE',
      'I': 'I NEED HELP',
      'A': 'ATTENTION',
    };

    return completions[text.toUpperCase()] || text;
  }

  hasApiKey(): boolean {
    return this.apiKey.length > 0;
  }
}

export const llmService = new LLMService();