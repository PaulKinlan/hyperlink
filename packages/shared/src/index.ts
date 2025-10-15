// AI Provider types and interfaces
export type {
  ProviderType,
  ProviderConfig,
  AISettings,
} from './providers/types.js';

// AI Provider models and defaults
export { DEFAULT_MODELS } from './providers/models.js';

// AI Provider factory and utilities
export { ProviderFactory } from './providers/factory.js';

// AI Storage management
export { StorageManager } from './providers/storage.js';

// UI components
export { OptionsUI, getOptionsHTML, getOptionsStyles } from './ui/index.js';

// Generic utilities (for non-AI extensions like backlinks)
export type Link = string;

export type Backlink = {
  url: string;
  title: string;
  text: string;
  timestamps: number[];
  navigations?: number[];
};

export type Backlinks = Record<Link, Backlink[]>;

export class Storage {
  async get(key: string) {
    return (await chrome.storage.local.get(key))[key];
  }

  async set(key: string, value: unknown) {
    return chrome.storage.local.set({ [key]: value });
  }
}
