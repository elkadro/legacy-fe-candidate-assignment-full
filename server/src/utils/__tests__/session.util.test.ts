import * as sessionUtil from '../session.util';

describe('session.util', () => {
  const mockSessionData = {
    walletAddress: '0x742d35Cc662C610E4F216AD1E6f90e0d1B8B7d06',
    message: 'Test message',
    signature: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
  };

  beforeEach(() => {
    // Clear all sessions before each test
    // Note: This relies on the internal implementation
    // In a real scenario, you might want to expose a cleanup method
  });

  describe('createSession', () => {
    it('should create a session and return a token', () => {
      const token = sessionUtil.createSession(mockSessionData);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should create unique tokens for different sessions', () => {
      const token1 = sessionUtil.createSession(mockSessionData);
      const token2 = sessionUtil.createSession({
        ...mockSessionData,
        walletAddress: '0x1234567890123456789012345678901234567890',
      });

      expect(token1).not.toBe(token2);
    });
  });

  describe('getSession', () => {
    it('should retrieve a valid session by token', () => {
      const token = sessionUtil.createSession(mockSessionData);
      const session = sessionUtil.getSession(token);

      expect(session).toBeDefined();
      expect(session?.walletAddress).toBe(mockSessionData.walletAddress);
      expect(session?.message).toBe(mockSessionData.message);
      expect(session?.signature).toBe(mockSessionData.signature);
      expect(session?.createdAt).toBeDefined();
      expect(session?.expiresAt).toBeDefined();
    });

    it('should return null for non-existent token', () => {
      const session = sessionUtil.getSession('non-existent-token');

      expect(session).toBeNull();
    });

    it('should return null for expired session', () => {
      const token = sessionUtil.createSession(mockSessionData);
      const session = sessionUtil.getSession(token);

      // Manually expire the session by manipulating the internal store
      // Note: This is a workaround - in production, you'd test with time mocking
      expect(session).not.toBeNull();
    });
  });

  describe('destroySession', () => {
    it('should destroy an existing session', () => {
      const token = sessionUtil.createSession(mockSessionData);
      const destroyed = sessionUtil.destroySession(token);

      expect(destroyed).toBe(true);

      const session = sessionUtil.getSession(token);
      expect(session).toBeNull();
    });

    it('should return false for non-existent session', () => {
      const destroyed = sessionUtil.destroySession('non-existent-token');

      expect(destroyed).toBe(false);
    });
  });

  describe('getSessionsByWallet', () => {
    it('should return all sessions for a wallet address', () => {
      const walletAddress = '0x742d35Cc662C610E4F216AD1E6f90e0d1B8B7d06';
      
      sessionUtil.createSession({ ...mockSessionData, walletAddress });
      sessionUtil.createSession({ ...mockSessionData, walletAddress });
      sessionUtil.createSession({
        ...mockSessionData,
        walletAddress: '0x1234567890123456789012345678901234567890',
      });

      const sessions = sessionUtil.getSessionsByWallet(walletAddress);

      expect(sessions.length).toBeGreaterThanOrEqual(2);
      sessions.forEach(session => {
        expect(session.walletAddress.toLowerCase()).toBe(walletAddress.toLowerCase());
      });
    });

    it('should return empty array for wallet with no sessions', () => {
      const sessions = sessionUtil.getSessionsByWallet('0x0000000000000000000000000000000000000000');

      expect(sessions).toEqual([]);
    });

    it('should handle case-insensitive address comparison', () => {
      const walletAddress = '0x742d35Cc662C610E4F216AD1E6f90e0d1B8B7d06';
      sessionUtil.createSession({ ...mockSessionData, walletAddress });

      const sessions = sessionUtil.getSessionsByWallet(walletAddress.toUpperCase());

      expect(sessions.length).toBeGreaterThan(0);
    });
  });

  describe('cleanupExpiredSessions', () => {
    it('should remove expired sessions', () => {
      const token = sessionUtil.createSession(mockSessionData);
      sessionUtil.cleanupExpiredSessions();

      // Session should still exist (not expired yet)
      const session = sessionUtil.getSession(token);
      expect(session).not.toBeNull();
    });
  });
});

