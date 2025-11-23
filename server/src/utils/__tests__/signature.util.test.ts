import { ethers } from 'ethers';
import * as signatureUtil from '../signature.util';
import { AppError } from '../error.util';

describe('signature.util', () => {
  let wallet: ethers.Wallet;
  let testMessage: string;

  beforeAll(() => {
    wallet = ethers.Wallet.createRandom();
    testMessage = 'Hello, Web3!';
  });

  describe('recoverSigner', () => {
    it('should recover the correct signer address from a valid signature', async () => {
      const signature = await wallet.signMessage(testMessage);
      const recoveredAddress = await signatureUtil.recoverSigner(testMessage, signature);

      expect(recoveredAddress.toLowerCase()).toBe(wallet.address.toLowerCase());
    });

    it('should return a checksummed address', async () => {
      const signature = await wallet.signMessage(testMessage);
      const recoveredAddress = await signatureUtil.recoverSigner(testMessage, signature);

      expect(recoveredAddress).toBe(ethers.getAddress(wallet.address));
    });

    it('should throw AppError for invalid signature format', async () => {
      await expect(
        signatureUtil.recoverSigner(testMessage, 'invalid-signature')
      ).rejects.toThrow(AppError);
    });

    it('should throw AppError for non-hex signature', async () => {
      await expect(
        signatureUtil.recoverSigner(testMessage, '0xnothex')
      ).rejects.toThrow(AppError);
    });

    it('should throw AppError for empty signature', async () => {
      await expect(
        signatureUtil.recoverSigner(testMessage, '')
      ).rejects.toThrow(AppError);
    });
  });

  describe('verifySignature', () => {
    it('should return true for a valid signature', async () => {
      const signature = await wallet.signMessage(testMessage);
      const isValid = await signatureUtil.verifySignature(
        testMessage,
        signature,
        wallet.address
      );

      expect(isValid).toBe(true);
    });

    it('should return false for a signature with wrong message', async () => {
      const signature = await wallet.signMessage(testMessage);
      const isValid = await signatureUtil.verifySignature(
        'Different message',
        signature,
        wallet.address
      );

      expect(isValid).toBe(false);
    });

    it('should return false for a signature with wrong address', async () => {
      const otherWallet = ethers.Wallet.createRandom();
      const signature = await wallet.signMessage(testMessage);
      const isValid = await signatureUtil.verifySignature(
        testMessage,
        signature,
        otherWallet.address
      );

      expect(isValid).toBe(false);
    });

    it('should handle case-insensitive address comparison', async () => {
      const signature = await wallet.signMessage(testMessage);
      const isValid = await signatureUtil.verifySignature(
        testMessage,
        signature,
        wallet.address.toUpperCase()
      );

      expect(isValid).toBe(true);
    });

    it('should return false for invalid signature format', async () => {
      const isValid = await signatureUtil.verifySignature(
        testMessage,
        'invalid-signature',
        wallet.address
      );

      expect(isValid).toBe(false);
    });
  });

  describe('isValidAddress', () => {
    it('should return true for valid Ethereum address', () => {
      expect(signatureUtil.isValidAddress(wallet.address)).toBe(true);
    });

    it('should return false for invalid address', () => {
      expect(signatureUtil.isValidAddress('invalid')).toBe(false);
      expect(signatureUtil.isValidAddress('0x123')).toBe(false);
      expect(signatureUtil.isValidAddress('')).toBe(false);
    });
  });

  describe('getChecksumAddress', () => {
    it('should return checksummed address for valid address', () => {
      const address = wallet.address.toLowerCase();
      const checksummed = signatureUtil.getChecksumAddress(address);

      expect(checksummed).toBe(ethers.getAddress(address));
    });

    it('should throw AppError for invalid address', () => {
      expect(() => signatureUtil.getChecksumAddress('invalid')).toThrow(AppError);
    });
  });

  describe('hashMessage', () => {
    it('should hash a message correctly', () => {
      const hash = signatureUtil.hashMessage(testMessage);
      const expectedHash = ethers.hashMessage(testMessage);

      expect(hash).toBe(expectedHash);
    });

    it('should produce different hashes for different messages', () => {
      const hash1 = signatureUtil.hashMessage('Message 1');
      const hash2 = signatureUtil.hashMessage('Message 2');

      expect(hash1).not.toBe(hash2);
    });
  });
});

