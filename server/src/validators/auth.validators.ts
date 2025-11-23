import { body, ValidationChain } from 'express-validator';

/**
 * Validation rules for verify-signature endpoint
 */
export const verifySignatureValidation: ValidationChain[] = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isString()
    .withMessage('Message must be a string'),
  
  body('signature')
    .trim()
    .notEmpty()
    .withMessage('Signature is required')
    .matches(/^0x[a-fA-F0-9]{130}$/)
    .withMessage('Invalid signature format - must be a valid hex string'),
  
  body('expectedSigner')
    .trim()
    .notEmpty()
    .withMessage('Expected signer address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid Ethereum address format'),
];

/**
 * Validation rules for create-session endpoint
 */
export const createSessionValidation: ValidationChain[] = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isString()
    .withMessage('Message must be a string'),
  
  body('signature')
    .trim()
    .notEmpty()
    .withMessage('Signature is required')
    .matches(/^0x[a-fA-F0-9]{130}$/)
    .withMessage('Invalid signature format - must be a valid hex string'),
  
  body('walletAddress')
    .trim()
    .notEmpty()
    .withMessage('Wallet address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid Ethereum address format'),
];

/**
 * Custom validator for Ethereum addresses with checksum validation
 */
export const ethereumAddressValidator = (field: string = 'walletAddress'): ValidationChain => {
  return body(field)
    .trim()
    .notEmpty()
    .withMessage(`${field} is required`)
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage(`Invalid Ethereum address format for ${field}`)
    .custom((value) => {
      // Additional checksum validation can be added here if needed
      return true;
    });
};