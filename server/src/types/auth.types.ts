export interface VerifySignatureRequest {
    message: string;
    signature: string;
    expectedSigner: string;
  }
  
  export interface VerifySignatureResponse {
    success: boolean;
    data: {
      isValid: boolean;
      signer: string;
      originalMessage: string;
      timestamp: string;
    };
  }
  
  export interface CreateSessionRequest {
    message: string;
    signature: string;
    walletAddress: string;
  }
  
  export interface SessionResponse {
    success: boolean;
    data: {
      sessionToken?: string;
      walletAddress: string;
      expiresAt: string;
    };
  }