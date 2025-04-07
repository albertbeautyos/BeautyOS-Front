/**
 * Class to manage sessionStorage interactions safely in Next.js.
 */
export class SessionStorageManager {
  /**
   * Retrieves an item from sessionStorage.
   * @param key The key of the item to retrieve.
   * @returns The item's value, or null if not found or if run on the server.
   */
  static get(key: string): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(key);
    }
    return null;
  }

  /**
   * Sets an item in sessionStorage.
   * @param key The key of the item to set.
   * @param value The value to set.
   */
  static set(key: string, value: string): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(key, value);
    }
  }

  /**
   * Removes an item from sessionStorage.
   * @param key The key of the item to remove.
   */
  static remove(key: string): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(key);
    }
  }
}