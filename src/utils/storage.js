// Обгортка над localStorage з JSON-серіалізацією і namespace-префіксом.

const PREFIX = 'teplodim:';

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn('storage.set failed', e);
    }
  },
  remove(key) {
    localStorage.removeItem(PREFIX + key);
  },
};
