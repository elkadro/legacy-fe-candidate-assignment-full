export interface SignedMessage {
    id: string;
    message: string;
    signature: string;
    timestamp: number;
    verified?: boolean;
    signer?: string;
  }
  
  export interface VerificationResult {
    isValid: boolean;
    signer: string;
    originalMessage: string;
    timestamp: string;
  }
  
  export interface SignatureHistoryItem extends SignedMessage {
    verificationResult?: VerificationResult;
  }