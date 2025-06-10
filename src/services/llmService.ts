export interface LLMResponse {
  correctedText: string;
  confidence: number;
  originalText: string;
}

class LLMService {
  private apiKey: string = import.meta.env.VITE_LLM_API_KEY;
  private baseUrl: string = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;

  async correctText(rawLetters: string): Promise<LLMResponse> {
    const prompt = `Correct any errors and complete the following sequence of predicted EEG letters into a coherent Arabic sentence. letters will be mashed together into one string of letter. seperate them into correct arabic words and sentences. the letters may contain errors due to EEG signal noise. Return only the corrected sentence without explanations: "${rawLetters}"`;
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
