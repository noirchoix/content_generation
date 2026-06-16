import { env } from '$env/dynamic/private';
import type { GeneratePayload } from '$lib/types/content';
import { buildPromptMessages } from '$lib/server/llm/buildPrompt';

export type ChatRole = 'system' | 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

type OpenRouterApiResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

type DeepSeekApiResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

export type ProviderName = 'deepseek' | 'openrouter';

export type ProviderResult = {
  provider: ProviderName;
  model: string;
  content: string;
};

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_DEFAULT_MODEL = 'google/gemma-3n-e4b-it:free';
const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_DEFAULT_MODEL = 'deepseek-chat';
const DEFAULT_TIMEOUT_MS = 12_000;

function requireEnv(name: string, value: string | undefined): string {
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function logProviderError(provider: ProviderName, details: Record<string, unknown>) {
  console.error(`[llm:${provider}] request failed`);
  console.error(JSON.stringify(details, null, 2));
}

function logProviderInfo(provider: ProviderName, details: Record<string, unknown>) {
  console.log(`[llm:${provider}]`);
  console.log(JSON.stringify(details, null, 2));
}

async function callDeepSeek(
  messages: ChatMessage[],
  options?: { model?: string; temperature?: number; timeoutMs?: number }
): Promise<ProviderResult> {
  const apiKey = requireEnv('DEEPSEEK_API_KEY', env.DEEPSEEK_API_KEY);
  const model = options?.model?.trim() || env.DEEPSEEK_MODEL?.trim() || DEEPSEEK_DEFAULT_MODEL;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    logProviderInfo('deepseek', {
      model,
      timeoutMs,
      messageCount: messages.length
    });

    const response = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.7
      }),
      signal: controller.signal
    });

    const rawText = await response.text();

    let data: DeepSeekApiResponse;
    try {
      data = JSON.parse(rawText) as DeepSeekApiResponse;
    } catch {
      logProviderError('deepseek', {
        model,
        status: response.status,
        statusText: response.statusText,
        rawSnippet: rawText.slice(0, 1000)
      });
      throw new Error(`DeepSeek returned non-JSON response: ${rawText.slice(0, 500)}`);
    }

    if (!response.ok) {
      logProviderError('deepseek', {
        model,
        status: response.status,
        statusText: response.statusText,
        errorMessage: data?.error?.message,
        rawSnippet: rawText.slice(0, 1000)
      });

      throw new Error(
        data?.error?.message || `DeepSeek error: ${response.status} ${rawText.slice(0, 500)}`
      );
    }

    const content = data?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      logProviderError('deepseek', {
        model,
        status: response.status,
        reason: 'empty completion',
        rawSnippet: rawText.slice(0, 1000)
      });
      throw new Error('DeepSeek returned an empty completion.');
    }

    return {
      provider: 'deepseek',
      model,
      content
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      logProviderError('deepseek', {
        model,
        timeoutMs,
        reason: 'request timeout'
      });
      throw new Error(`DeepSeek request timed out after ${timeoutMs}ms.`);
    }

    logProviderError('deepseek', {
      model,
      caughtError: error instanceof Error ? error.message : String(error)
    });

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function callOpenRouter(
  messages: ChatMessage[],
  options?: { model?: string; temperature?: number; timeoutMs?: number }
): Promise<ProviderResult> {
  const apiKey = requireEnv('OPENROUTER_API_KEY', env.OPENROUTER_API_KEY);
  const model =
    options?.model?.trim() || env.OPENROUTER_MODEL?.trim() || OPENROUTER_DEFAULT_MODEL;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    logProviderInfo('openrouter', {
      model,
      timeoutMs,
      messageCount: messages.length,
      referer: env.OPENROUTER_HTTP_REFERER?.trim() || 'http://localhost:5173',
      appTitle: env.OPENROUTER_APP_TITLE?.trim() || 'AI Social Content Engine'
    });

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': env.OPENROUTER_HTTP_REFERER?.trim() || 'http://localhost:5173',
        'X-OpenRouter-Title': env.OPENROUTER_APP_TITLE?.trim() || 'AI Social Content Engine',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.7
      }),
      signal: controller.signal
    });

    const rawText = await response.text();

    let data: OpenRouterApiResponse;
    try {
      data = JSON.parse(rawText) as OpenRouterApiResponse;
    } catch {
      logProviderError('openrouter', {
        model,
        status: response.status,
        statusText: response.statusText,
        rawSnippet: rawText.slice(0, 1000)
      });
      throw new Error(`OpenRouter returned non-JSON response: ${rawText.slice(0, 500)}`);
    }

    if (!response.ok) {
      logProviderError('openrouter', {
        model,
        status: response.status,
        statusText: response.statusText,
        errorMessage: data?.error?.message,
        rawSnippet: rawText.slice(0, 1000)
      });

      throw new Error(
        data?.error?.message || `OpenRouter error: ${response.status} ${rawText.slice(0, 500)}`
      );
    }

    const content = data?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      logProviderError('openrouter', {
        model,
        status: response.status,
        reason: 'empty completion',
        rawSnippet: rawText.slice(0, 1000)
      });
      throw new Error('OpenRouter returned an empty completion.');
    }

    return {
      provider: 'openrouter',
      model,
      content
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      logProviderError('openrouter', {
        model,
        timeoutMs,
        reason: 'request timeout'
      });
      throw new Error(`OpenRouter request timed out after ${timeoutMs}ms.`);
    }

    logProviderError('openrouter', {
      model,
      caughtError: error instanceof Error ? error.message : String(error)
    });

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateContent(
  payload: GeneratePayload & { text: string }
): Promise<ProviderResult> {
  const messages = buildPromptMessages({
    text: payload.text,
    platform: payload.platform,
    format: payload.format,
    brandVoice: payload.brandVoice
  });

  const errors: string[] = [];

  try {
    return await callDeepSeek(messages, {
      temperature: 0.7
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`DeepSeek failed: ${message}`);
    console.warn(`[llm] falling back from DeepSeek to OpenRouter: ${message}`);
  }

  try {
    return await callOpenRouter(messages, {
      temperature: 0.7
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`OpenRouter failed: ${message}`);
    console.error('[llm] all providers failed');
    console.error(errors.join(' | '));
    throw new Error(errors.join(' | '));
  }
}