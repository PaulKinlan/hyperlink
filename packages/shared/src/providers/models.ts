import type { ProviderType } from './types';

export const DEFAULT_MODELS: Record<ProviderType, string[]> = {
  openai: ['gpt-5', 'gpt-5-nano'],
  anthropic: ['claude-4-5-sonnet'],
  google: ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro'],
  chrome: ['chrome-built-in'], // Chrome has one built-in model
  custom: [],
};

// Define which providers require an API key
export const REQUIRES_API_KEY: Record<ProviderType, boolean> = {
  openai: true,
  anthropic: true,
  google: true,
  chrome: false, // Chrome uses built-in AI, no API key needed
  custom: true,
};

// Define which providers require model selection
export const REQUIRES_MODEL_SELECTION: Record<ProviderType, boolean> = {
  openai: true,
  anthropic: true,
  google: true,
  chrome: false, // Chrome has a single built-in model
  custom: true,
};

export const DEFAULT_SETTINGS = {
  activeProviderId: null,
  providers: {},
};
