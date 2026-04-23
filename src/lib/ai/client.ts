/**
 * AI client factory — plan §11, §8.
 * Wraps OpenRouter via the Vercel AI SDK. When no API key is configured,
 * we surface a mock flag so callers can fall back to a canned stream. This
 * keeps the feature demo-able without a paid key.
 */

import { createOpenRouter } from "@openrouter/ai-sdk-provider";

type AIClient = {
  readonly mock: boolean;
  /**
   * Returns a language model wrapped by the AI SDK. Throws if `mock` is true
   * — callers must check `mock` first.
   */
  model(id: string): ReturnType<ReturnType<typeof createOpenRouter>["chat"]>;
};

export function getAIClient(): AIClient {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  const mockEnv = process.env.AI_MOCK_MODE?.trim().toLowerCase() === "true";
  const mock = mockEnv || !apiKey;

  if (mock) {
    return {
      mock: true,
      model(): never {
        throw new Error("AI client is in mock mode — check `client.mock` first");
      },
    };
  }

  const openrouter = createOpenRouter({ apiKey });
  return {
    mock: false,
    model(id: string) {
      return openrouter.chat(id);
    },
  };
}

// --- Models (plan §11): cheap streaming chat, strong structured-output for feedback.
export const MODEL_CHAT = "google/gemini-2.0-flash-001";
export const MODEL_FEEDBACK = "anthropic/claude-sonnet-4";
