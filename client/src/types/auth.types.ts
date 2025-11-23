export interface User {
    email: string;
    walletAddress?: string;
    userId: string;
    verifiedCredentials?: string[];
  }
  
  export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    primaryWallet: any;
    mfaEnabled: boolean;
  }
  
  export interface LoginCredentials {
    email: string;
  }
  
  export interface MFASetupResponse {
    secret: string;
    qrCode: string;
  }