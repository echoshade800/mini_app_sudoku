// Bridge for Paradot integration with localStorage fallback

interface DotStorage {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
}

interface DotAnalytics {
  track(event: string, properties?: Record<string, any>): void;
}

interface DotAPI {
  storage: DotStorage;
  analytics: DotAnalytics;
}

declare global {
  interface Window {
    dot?: DotAPI;
  }
}

class MockStorage implements DotStorage {
  async get(key: string): Promise<any> {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }
}

class MockAnalytics implements DotAnalytics {
  track(event: string, properties?: Record<string, any>): void {
    console.log('Analytics:', event, properties);
  }
}

export const storage: DotStorage = window.dot?.storage || new MockStorage();
export const analytics: DotAnalytics = window.dot?.analytics || new MockAnalytics();

export const isParadotEnvironment = () => !!window.dot;