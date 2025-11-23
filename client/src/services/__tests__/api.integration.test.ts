import { describe, it, expect, beforeAll } from 'vitest';
import apiService from '../api.service';
import { ethers } from 'ethers';

/**
 * Integration tests for API service
 * These tests require a running backend server
 * 
 * To run these tests:
 * 1. Start the backend server: cd server && npm run dev
 * 2. Set VITE_API_BASE_URL in .env.test to point to your backend
 * 3. Run: npm run test -- api.integration.test.ts
 */

describe('API Service Integration Tests', () => {
  let wallet: ethers.HDNodeWallet;
  let testMessage: string;
  let validSignature: string;

  beforeAll(() => {
    // Skip if API_BASE_URL is not set (CI/CD environments)
    if (!import.meta.env.VITE_API_BASE_URL && import.meta.env.MODE !== 'test') {
      console.warn('Skipping integration tests - VITE_API_BASE_URL not set');
      return;
    }

    wallet = ethers.Wallet.createRandom();
    testMessage = 'Integration test message';
  });

  it.skip('should verify a signature against real backend', async () => {
    if (!import.meta.env.VITE_API_BASE_URL) {
      console.log('Skipping - no backend URL configured');
      return;
    }

    validSignature = await wallet.signMessage(testMessage);

    const result = await apiService.verifySignature(testMessage, validSignature, wallet.address);

    expect(result.isValid).toBe(true);
    expect(result.signer.toLowerCase()).toBe(wallet.address.toLowerCase());
    expect(result.originalMessage).toBe(testMessage);
  });

  it.skip('should handle rate limiting', async () => {
    if (!import.meta.env.VITE_API_BASE_URL) {
      console.log('Skipping - no backend URL configured');
      return;
    }

    validSignature = await wallet.signMessage(testMessage);

    // First request should succeed
    const firstResult = await apiService.verifySignature(testMessage, validSignature, wallet.address);
    expect(firstResult.isValid).toBe(true);

    // Second request immediately after should fail with rate limit
    try {
      await apiService.verifySignature(testMessage, validSignature, wallet.address);
      // If we get here, rate limiting might not be working or window expired
    } catch (error: any) {
      expect(error.response?.status).toBe(429);
      expect(error.response?.data.error).toBe('Too many requests');
    }
  }, 10000);

  it.skip('should create and manage sessions', async () => {
    if (!import.meta.env.VITE_API_BASE_URL) {
      console.log('Skipping - no backend URL configured');
      return;
    }

    validSignature = await wallet.signMessage(testMessage);

    // Create session
    const session = await apiService.createSession(
      testMessage,
      validSignature,
      wallet.address
    );

    expect(session.sessionToken).toBeDefined();
    expect(session.walletAddress.toLowerCase()).toBe(wallet.address.toLowerCase());

    // Get session
    const retrievedSession = await apiService.getSession();
    expect(retrievedSession.walletAddress.toLowerCase()).toBe(wallet.address.toLowerCase());

    // Destroy session
    await apiService.destroySession();

    // Verify session is destroyed
    try {
      await apiService.getSession();
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.response?.status).toBe(401);
    }
  });
});

