export type ProviderType = 'openai' | 'anthropic' | 'google' | 'custom';

export interface ProviderConfig {
  id: string;
  name: string;
  type: ProviderType;
  apiKey: string;
  model: string;
  baseUrl?: string;
  enabled: boolean;
  createdAt: number;
}

export interface MergeSettings {
  activeProviderId: string | null;
  providers: {
    [id: string]: ProviderConfig;
  };
}

export const DEFAULT_MODELS: Record<ProviderType, string[]> = {
  openai: ['gpt-5', 'gpt-5-nano'],
  anthropic: ['claude-4-5-sonnet'],
  google: ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro'],
  custom: [],
};

export const DEFAULT_SETTINGS: MergeSettings = {
  activeProviderId: null,
  providers: {},
};
