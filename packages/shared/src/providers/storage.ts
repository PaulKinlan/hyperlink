import type { AISettings } from './types';
import { DEFAULT_SETTINGS } from './models';

export class StorageManager {
  constructor(private storageKey: string) {}

  async getSettings(): Promise<AISettings> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([this.storageKey], (data) => {
        resolve(data[this.storageKey] || DEFAULT_SETTINGS);
      });
    });
  }

  async saveSettings(settings: AISettings): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [this.storageKey]: settings }, resolve);
    });
  }

  async getActiveProvider() {
    const settings = await this.getSettings();
    if (!settings.activeProviderId) {
      return null;
    }
    return settings.providers[settings.activeProviderId] || null;
  }
}
