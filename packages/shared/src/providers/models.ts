import type { ProviderType } from './types';

export const DEFAULT_MODELS: Record<ProviderType, string[]> = {
  openai: ['gpt-5', 'gpt-5-nano'],
  anthropic: ['claude-4-5-sonnet'],
  google: ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro'],
  custom: [],
};

export const DEFAULT_SETTINGS = {
  activeProviderId: null,
  providers: {},
};
