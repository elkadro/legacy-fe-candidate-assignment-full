import request from 'supertest';
import express from 'express';
import app from '../app';
import { ethers } from 'ethers';
import { clearRateLimitStore } from '../middleware/rateLimit.middleware';

// Helper to get a unique IP for each test to avoid rate limiting
let testIpCounter = 1;
const getUniqueTestIp = () => `192.168.1.${testIpCounter++}`;

describe('Auth Routes Integration Tests', () => {
  let wallet: ethers.Wallet;
  let testMessage: string;
  let validSignature: string;

  beforeAll(async () => {
    wallet = ethers.Wallet.createRandom();
    testMessage = 'Hello, Web3! This is a test message.';
    validSignature = await wallet.signMessage(testMessage);
  });

  beforeEach(() => {
    // Clear rate limit store before each test to avoid interference
    clearRateLimitStore();
  });

  afterEach(() => {
    // Clear rate limit store after each test
    clearRateLimitStore();
  });

  describe('POST /api/auth/verify-signature', () => {
    it('should verify a valid signature', async () => {
      const response = await request(app)
        .post('/api/auth/verify-signature')
        .set('X-Forwarded-For', getUniqueTestIp())
        .send({
          message: testMessage,
          signature: validSignature,
          expectedSigner: wallet.address,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(true);
      expect(response.body.data.signer.toLowerCase()).toBe(wallet.address.toLowerCase());
      expect(response.body.data.originalMessage).toBe(testMessage);
      expect(response.body.data.timestamp).toBeDefined();
    });

    it('should reject invalid signature format', async () => {
      const response = await request(app)
        .post('/api/auth/verify-signature')
        .set('X-Forwarded-For', getUniqueTestIp())
        .send({
          message: testMessage,
          signature: 'invalid-signature',
          expectedSigner: wallet.address,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject empty message', async () => {
      const response = await request(app)
        .post('/api/auth/verify-signature')
        .set('X-Forwarded-For', getUniqueTestIp())
        .send({
          message: '',
          signature: validSignature,
          expectedSigner: wallet.address,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject missing signature', async () => {
      const response = await request(app)
        .post('/api/auth/verify-signature')
        .set('X-Forwarded-For', getUniqueTestIp())
        .send({
          message: testMessage,
          expectedSigner: wallet.address,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject missing expectedSigner', async () => {
      const response = await request(app)
        .post('/api/auth/verify-signature')
        .set('X-Forwarded-For', getUniqueTestIp())
        .send({
          message: testMessage,
          signature: validSignature,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject signature when expectedSigner does not match recovered signer', async () => {
      const otherWallet = ethers.Wallet.createRandom();
      const response = await request(app)
        .post('/api/auth/verify-signature')
        .set('X-Forwarded-For', getUniqueTestIp())
        .send({
          message: testMessage,
          signature: validSignature,
          expectedSigner: otherWallet.address, // Different address than the signer
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('expected signer');
    });

    it('should reject signature when message does not match (wrong message)', async () => {
      const wrongMessage = 'Different message';
      const response = await request(app)
        .post('/api/auth/verify-signature')
        .set('X-Forwarded-For', getUniqueTestIp())
        .send({
          message: wrongMessage,
          signature: validSignature, // Signature for different message
          expectedSigner: wallet.address,
        })
        .expect(401);

      // When message doesn't match, ethers.verifyMessage will either throw or recover wrong address
      // Either way, it won't match the expectedSigner
      expect(response.body.success).toBe(false);
    });

    it('should enforce rate limiting', async () => {
      const testIp = getUniqueTestIp();
      
      // First request should succeed
      await request(app)
        .post('/api/auth/verify-signature')
        .set('X-Forwarded-For', testIp)
        .send({
          message: testMessage,
          signature: validSignature,
          expectedSigner: wallet.address,
        })
        .expect(200);

      // Second request immediately after should be rate limited (same IP)
      const response = await request(app)
        .post('/api/auth/verify-signature')
        .set('X-Forwarded-For', testIp)
        .send({
          message: testMessage,
          signature: validSignature,
          expectedSigner: wallet.address,
        })
        .expect(429);

      expect(response.body.error).toBe('Too many requests');
      expect(response.body.retryAfter).toBeDefined();
    }, 10000); // Increase timeout for rate limit test
  });

  describe('POST /api/auth/session', () => {
    it('should create a session with valid signature', async () => {
      const response = await request(app)
        .post('/api/auth/session')
        .set('X-Forwarded-For', getUniqueTestIp())
        .send({
          message: testMessage,
          signature: validSignature,
          walletAddress: wallet.address,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sessionToken).toBeDefined();
      expect(response.body.data.walletAddress.toLowerCase()).toBe(wallet.address.toLowerCase());
      expect(response.body.data.expiresAt).toBeDefined();
    });

    it('should reject session creation with mismatched wallet address', async () => {
      const otherWallet = ethers.Wallet.createRandom();
      const response = await request(app)
        .post('/api/auth/session')
        .set('X-Forwarded-For', getUniqueTestIp())
        .send({
          message: testMessage,
          signature: validSignature,
          walletAddress: otherWallet.address, // Different address
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject invalid wallet address format', async () => {
      const response = await request(app)
        .post('/api/auth/session')
        .set('X-Forwarded-For', getUniqueTestIp())
        .send({
          message: testMessage,
          signature: validSignature,
          walletAddress: 'invalid-address',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/session', () => {
    it('should return 401 when no session token provided', async () => {
      const response = await request(app)
        .get('/api/auth/session')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return session info with valid token', async () => {
      // First create a session
      const createResponse = await request(app)
        .post('/api/auth/session')
        .set('X-Forwarded-For', getUniqueTestIp())
        .send({
          message: testMessage,
          signature: validSignature,
          walletAddress: wallet.address,
        })
        .expect(201);

      const sessionToken = createResponse.body.data.sessionToken;

      // Then get the session
      const getResponse = await request(app)
        .get('/api/auth/session')
        .set('Cookie', `sessionToken=${sessionToken}`)
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.walletAddress.toLowerCase()).toBe(wallet.address.toLowerCase());
    });
  });

  describe('DELETE /api/auth/session', () => {
    it('should destroy session successfully', async () => {
      // Create a session first
      const createResponse = await request(app)
        .post('/api/auth/session')
        .set('X-Forwarded-For', getUniqueTestIp())
        .send({
          message: testMessage,
          signature: validSignature,
          walletAddress: wallet.address,
        })
        .expect(201);

      const sessionToken = createResponse.body.data.sessionToken;

      // Destroy the session
      const deleteResponse = await request(app)
        .delete('/api/auth/session')
        .set('Cookie', `sessionToken=${sessionToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.message).toBe('Session destroyed successfully');

      // Verify session is destroyed
      await request(app)
        .get('/api/auth/session')
        .set('Cookie', `sessionToken=${sessionToken}`)
        .expect(401);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });
  });
});

