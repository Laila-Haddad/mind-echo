export interface LLMResponse {
  correctedText: string;
  confidence: number;
  originalText: string;
}

class LLMService {
  private apiKey: string = import.meta.env.VITE_LLM_API_KEY;
  private baseUrl: string = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;

  async correctText(rawLetters: string): Promise<LLMResponse> {
    const prompt = `this is a sequence of predicted arabic EEG letters. they might shape a word or a full sentence. the letters may contain errors due to EEG signal noise so please correct them if it makes more sense for the meaning. Return only the corrected sentence without explanations. i must receive the same amount of letters that i sent. if you cannot make a coherent sentence, just return the letters as they are. and of course the word/sentence must be in arabic. these are the letters : "${rawLetters}"`;
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status}`);
      }

      const data = await response.json();
      const correctedText =
      data?.candidates[0].content.parts[0].text.trim() || rawLetters;

      return {
        correctedText,
        confidence: 0.85,
        originalText: rawLetters,
      };
    } catch (error) {
      console.error("LLM service error:", error);
    }
  }
}

export const llmService = new LLMService();
