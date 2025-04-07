/**
 * Class to manage localStorage interactions safely in Next.js.
 */
export class LocalStorageManager {
  /**
   * Retrieves an item from localStorage.
   * @param key The key of the item to retrieve.
   * @returns The item's value, or null if not found or if run on the server.
   */
  static get(key: string): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  }

  /**
   * Sets an item in localStorage.
   * @param key The key of the item to set.
   * @param value The value to set.
   */
  static set(key: string, value: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }

  /**
   * Removes an item from localStorage.
   * @param key The key of the item to remove.
   */
  static remove(key: string): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
}