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
