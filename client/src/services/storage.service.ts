class StorageService {
  /**
   * Get a value from localStorage
   */
  get<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  }

  /**
   * Set a value in localStorage
   */
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
    }
  }

  /**
   * Remove a key from localStorage
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
    }
  }

  /**
   * Clear all localStorage
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Get a user-specific key (for multi-user support)
   */
  getUserKey(baseKey: string, email: string | null | undefined): string {
    if (!email) {
      return baseKey;
    }
    // Normalize email to lowercase and create a safe key
    const normalizedEmail = email.toLowerCase().trim();
    return `${baseKey}_${normalizedEmail}`;
  }

  /**
   * Get a value for a specific user
   */
  getForUser<T>(baseKey: string, email: string | null | undefined): T | null {
    const userKey = this.getUserKey(baseKey, email);
    return this.get<T>(userKey);
  }

  /**
   * Set a value for a specific user
   */
  setForUser<T>(baseKey: string, email: string | null | undefined, value: T): void {
    const userKey = this.getUserKey(baseKey, email);
    this.set(userKey, value);
  }

  /**
   * Remove a value for a specific user
   */
  removeForUser(baseKey: string, email: string | null | undefined): void {
    const userKey = this.getUserKey(baseKey, email);
    this.remove(userKey);
  }

  /**
   * Clear all data for a specific user (all keys starting with user prefix)
   */
  clearUserData(email: string | null | undefined): void {
    if (!email) {
      return;
    }
    const normalizedEmail = email.toLowerCase().trim();
    const prefix = `_${normalizedEmail}`;
    
    try {
      // Get all keys from localStorage
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.endsWith(prefix)) {
          keys.push(key);
        }
      }
      
      // Remove all user-specific keys
      keys.forEach(key => this.remove(key));
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }
}

export default new StorageService();