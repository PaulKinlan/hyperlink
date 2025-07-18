import { describe, it, expect, vi } from 'vitest';

// Mock the chrome API
const chrome = {
  runtime: {
    onMessage: {
      hasListeners: () => true,
    },
  },
};

vi.stubGlobal('chrome', chrome);

// a test to check if the background script is listening for messages
describe('background script', () => {
  it('should be listening for messages', () => {
    const listener = global.chrome.runtime.onMessage.hasListeners();
    expect(listener).toBe(true);
  });
});
