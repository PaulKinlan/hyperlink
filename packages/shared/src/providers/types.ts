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

export interface AISettings {
  activeProviderId: string | null;
  providers: {
    [id: string]: ProviderConfig;
  };
}

export interface ProviderInstance {
  generateText: (prompt: string) => Promise<string>;
}
