import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { builtInAI } from '@built-in-ai/core';
import { generateText } from 'ai';
import type { ProviderConfig, ProviderInstance } from './types';

export class ProviderFactory {
  static create(config: ProviderConfig): ProviderInstance {
    switch (config.type) {
      case 'openai':
        return new OpenAIProvider(config);
      case 'anthropic':
        return new AnthropicProvider(config);
      case 'google':
        return new GoogleProvider(config);
      case 'chrome':
        return new ChromeProvider(config);
      case 'custom':
        return new CustomProvider(config);
      default:
        throw new Error(`Unknown provider type: ${config.type}`);
    }
  }
}

class OpenAIProvider implements ProviderInstance {
  private provider: ReturnType<typeof createOpenAI>;
  private model: string;

  constructor(config: ProviderConfig) {
    if (!config.apiKey) {
      throw new Error('OpenAI provider requires an API key');
    }
    if (!config.model) {
      throw new Error('OpenAI provider requires a model');
    }
    this.provider = createOpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
    this.model = config.model;
  }

  async generateText(prompt: string): Promise<string> {
    const result = await generateText({
      model: this.provider(this.model),
      prompt,
    });
    return result.text;
  }
}

class AnthropicProvider implements ProviderInstance {
  private provider: ReturnType<typeof createAnthropic>;
  private model: string;

  constructor(config: ProviderConfig) {
    if (!config.apiKey) {
      throw new Error('Anthropic provider requires an API key');
    }
    if (!config.model) {
      throw new Error('Anthropic provider requires a model');
    }
    this.provider = createAnthropic({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
    this.model = config.model;
  }

  async generateText(prompt: string): Promise<string> {
    const result = await generateText({
      model: this.provider(this.model),
      prompt,
    });
    return result.text;
  }
}

class GoogleProvider implements ProviderInstance {
  private provider: ReturnType<typeof createGoogleGenerativeAI>;
  private model: string;

  constructor(config: ProviderConfig) {
    if (!config.apiKey) {
      throw new Error('Google provider requires an API key');
    }
    if (!config.model) {
      throw new Error('Google provider requires a model');
    }
    this.provider = createGoogleGenerativeAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
    this.model = config.model;
  }

  async generateText(prompt: string): Promise<string> {
    const result = await generateText({
      model: this.provider(this.model),
      prompt,
    });
    return result.text;
  }
}

class ChromeProvider implements ProviderInstance {
  private model: ReturnType<typeof builtInAI>;

  constructor(config: ProviderConfig) {
    // Chrome built-in AI returns the model directly, not a factory
    this.model = builtInAI();
  }

  async generateText(prompt: string): Promise<string> {
    const result = await generateText({
      model: this.model,
      prompt,
    });
    return result.text;
  }
}

class CustomProvider implements ProviderInstance {
  private provider: ReturnType<typeof createOpenAI>;
  private model: string;

  constructor(config: ProviderConfig) {
    if (!config.baseUrl) {
      throw new Error('Custom provider requires a base URL');
    }
    if (!config.model) {
      throw new Error('Custom provider requires a model');
    }
    // Use OpenAI SDK for custom endpoints (most are OpenAI-compatible)
    this.provider = createOpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
    this.model = config.model;
  }

  async generateText(prompt: string): Promise<string> {
    const result = await generateText({
      model: this.provider(this.model),
      prompt,
    });
    return result.text;
  }
}
