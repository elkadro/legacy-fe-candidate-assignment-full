import crypto from 'crypto';
import { AppError } from './error.util';

interface Session {
  walletAddress: string;
  message: string;
  signature: string;
  createdAt: string;
  expiresAt: string;
}

interface SessionData {
  walletAddress: string;
  message: string;
  signature: string;
}

// In-memory session store (use Redis in production)
const sessions = new Map<string, Session>();

/**
 * Generate a secure session token
 */
const generateSessionToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Create a new session
 */
export const createSession = (data: SessionData): string => {
  const sessionToken = generateSessionToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

  sessions.set(sessionToken, {
    ...data,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });

  return sessionToken;
};

/**
 * Get session by token
 */
export const getSession = (token: string): Session | null => {
  const session = sessions.get(token);

  if (!session) {
    return null;
  }

  // Check if session is expired
  if (new Date(session.expiresAt) < new Date()) {
    sessions.delete(token);
    return null;
  }

  return session;
};

/**
 * Destroy a session
 */
export const destroySession = (token: string): boolean => {
  return sessions.delete(token);
};

/**
 * Clean up expired sessions (call this periodically)
 */
export const cleanupExpiredSessions = (): void => {
  const now = new Date();

  for (const [token, session] of sessions.entries()) {
    if (new Date(session.expiresAt) < now) {
      sessions.delete(token);
    }
  }
};

/**
 * Get all active sessions for a wallet (useful for multi-device scenarios)
 */
export const getSessionsByWallet = (walletAddress: string): Session[] => {
  const walletSessions: Session[] = [];

  for (const session of sessions.values()) {
    if (session.walletAddress.toLowerCase() === walletAddress.toLowerCase()) {
      walletSessions.push(session);
    }
  }

  return walletSessions;
};

// Run cleanup every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);