import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { handleValidationErrors, sanitizeRequest } from '../middleware/validation.middleware';
import { authRateLimit } from '../middleware/rateLimit.middleware';
import {
  verifySignatureValidation,
  createSessionValidation,
} from '../validators/auth.validators';

const router = Router();

/**
 * @route   POST /api/auth/verify-signature
 * @desc    Verify a signed message and return signer address
 * @access  Public
 * @rateLimit 1 request per 5 seconds per IP
 */
router.post(
  '/verify-signature',
  authRateLimit,
  sanitizeRequest,
  verifySignatureValidation,
  handleValidationErrors,
  authController.verifySignature
);

/**
 * @route   POST /api/auth/session
 * @desc    Create or validate a session after signature verification
 * @access  Public
 * @rateLimit 1 request per 5 seconds per IP
 */
router.post(
  '/session',
  authRateLimit,
  sanitizeRequest,
  createSessionValidation,
  handleValidationErrors,
  authController.createSession
);

/**
 * @route   GET /api/auth/session
 * @desc    Get current session info
 * @access  Private
 */
router.get('/session', authController.getSession);

/**
 * @route   DELETE /api/auth/session
 * @desc    Logout and destroy session
 * @access  Private
 */
router.delete('/session', authController.destroySession);

export default router;