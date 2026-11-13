// Polyfills for running unit tests under jsdom (the default Vitest environment).
// Ionic components such as ion-menu and ion-split-pane query `window.matchMedia`,
// which jsdom does not implement.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// In-memory Storage polyfill for headless/CI/Node 22 environments where localStorage is missing or restricted
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

function applyStorageMock(target: any, prop: string) {
  try {
    const storage = new MemoryStorage();
    Object.defineProperty(target, prop, {
      value: storage,
      configurable: true,
      enumerable: true,
      writable: true,
    });
  } catch {
    try {
      target[prop] = new MemoryStorage();
    } catch {}
  }
}

// Ensure window.localStorage and window.sessionStorage are functional
if (typeof window !== 'undefined') {
  try {
    if (!window.localStorage || typeof window.localStorage.getItem !== 'function') {
      applyStorageMock(window, 'localStorage');
    } else {
      window.localStorage.getItem('_test');
    }
  } catch {
    applyStorageMock(window, 'localStorage');
  }

  try {
    if (!window.sessionStorage || typeof window.sessionStorage.getItem !== 'function') {
      applyStorageMock(window, 'sessionStorage');
    } else {
      window.sessionStorage.getItem('_test');
    }
  } catch {
    applyStorageMock(window, 'sessionStorage');
  }
}

// Ensure globalThis.localStorage and globalThis.sessionStorage are functional (especially for Node 22+)
if (typeof globalThis !== 'undefined') {
  try {
    if (!(globalThis as any).localStorage || typeof (globalThis as any).localStorage.getItem !== 'function') {
      applyStorageMock(globalThis, 'localStorage');
    } else {
      (globalThis as any).localStorage.getItem('_test');
    }
  } catch {
    applyStorageMock(globalThis, 'localStorage');
  }

  try {
    if (!(globalThis as any).sessionStorage || typeof (globalThis as any).sessionStorage.getItem !== 'function') {
      applyStorageMock(globalThis, 'sessionStorage');
    } else {
      (globalThis as any).sessionStorage.getItem('_test');
    }
  } catch {
    applyStorageMock(globalThis, 'sessionStorage');
  }
}
