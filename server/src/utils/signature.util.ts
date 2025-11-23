import { ethers } from 'ethers';
import { AppError } from './error.util';

/**
 * Recover the signer's address from a message and signature
 */
export const recoverSigner = async (
  message: string,
  signature: string
): Promise<string> => {
  try {
    // Verify signature format
    if (!ethers.isHexString(signature)) {
      throw new AppError('Invalid signature format', 400);
    }

    // Recover the address - ethers.verifyMessage handles validation
    const signerAddress = ethers.verifyMessage(message, signature);

    // Validate recovered address
    if (!ethers.isAddress(signerAddress)) {
      throw new AppError('Failed to recover valid address', 400);
    }

    return ethers.getAddress(signerAddress);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    // If verifyMessage throws, the signature is invalid
    throw new AppError('Invalid signature for this message', 401);
  }
};

/**
 * Verify that a signature is valid for a given message and address
 */
export const verifySignature = async (
  message: string,
  signature: string,
  expectedAddress: string
): Promise<boolean> => {
  try {
    const recoveredAddress = await recoverSigner(message, signature);
    
    // Compare addresses (case-insensitive)
    return (
      recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()
    );
  } catch (error) {
    return false;
  }
};

/**
 * Validate Ethereum address format
 */
export const isValidAddress = (address: string): boolean => {
  return ethers.isAddress(address);
};

/**
 * Get checksummed address
 */
export const getChecksumAddress = (address: string): string => {
  if (!isValidAddress(address)) {
    throw new AppError('Invalid Ethereum address', 400);
  }
  return ethers.getAddress(address);
};

/**
 * Hash a message using keccak256 (useful for advanced signing scenarios)
 */
export const hashMessage = (message: string): string => {
  return ethers.hashMessage(message);
};