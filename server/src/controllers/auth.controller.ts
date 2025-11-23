import { Request, Response, NextFunction } from 'express';
import * as signatureUtil from '../utils/signature.util';
import * as sessionUtil from '../utils/session.util';
import { AppError } from '../utils/error.util';
import { 
  VerifySignatureRequest, 
  VerifySignatureResponse,
  CreateSessionRequest,
  SessionResponse 
} from '../types/auth.types';

/**
 * Verify a Web3 signature
 */
export const verifySignature = async (
  req: Request<{}, {}, VerifySignatureRequest>,
  res: Response<VerifySignatureResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { message, signature, expectedSigner } = req.body;

    // Recover signer address from signature
    // This will throw if signature doesn't match the message
    let signerAddress: string;
    try {
      signerAddress = await signatureUtil.recoverSigner(message, signature);
    } catch (error: any) {
      // If recovery fails, signature is invalid for this message
      throw new AppError('Invalid signature for this message', 401);
    }

    // Verify that the recovered signer matches the expected signer
    if (signerAddress.toLowerCase() !== expectedSigner.toLowerCase()) {
      throw new AppError('Signature does not match expected signer address', 401);
    }

    // Return verification result
    res.status(200).json({
      success: true,
      data: {
        isValid: true,
        signer: signerAddress,
        originalMessage: message,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a session after successful signature verification
 */
export const createSession = async (
  req: Request<{}, {}, CreateSessionRequest>,
  res: Response<SessionResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { message, signature, walletAddress } = req.body;

    // Verify signature before creating session
    const signerAddress = await signatureUtil.recoverSigner(message, signature);

    if (signerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new AppError('Signature does not match wallet address', 401);
    }

    // Create session
    const sessionToken = sessionUtil.createSession({
      walletAddress: signerAddress,
      message,
      signature,
    });

    // Set session cookie
    res.cookie('sessionToken', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(201).json({
      success: true,
      data: {
        sessionToken,
        walletAddress: signerAddress,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current session information
 */
export const getSession = async (
  req: Request,
  res: Response<SessionResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionToken = req.cookies?.sessionToken || req.headers.authorization?.split(' ')[1];

    if (!sessionToken) {
      throw new AppError('No session found', 401);
    }

    const session = sessionUtil.getSession(sessionToken);

    if (!session) {
      throw new AppError('Invalid or expired session', 401);
    }

    res.status(200).json({
      success: true,
      data: {
        walletAddress: session.walletAddress,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Destroy session (logout)
 */
export const destroySession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionToken = req.cookies?.sessionToken || req.headers.authorization?.split(' ')[1];

    if (sessionToken) {
      sessionUtil.destroySession(sessionToken);
    }

    res.clearCookie('sessionToken');

    res.status(200).json({
      success: true,
      message: 'Session destroyed successfully',
    });
  } catch (error) {
    next(error);
  }
};