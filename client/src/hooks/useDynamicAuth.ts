import { useState, useCallback, useEffect } from 'react';
import { useConnectWithOtp, useDynamicContext, useMfa } from '@dynamic-labs/sdk-react-core';
import toast from 'react-hot-toast';


type AuthenticationStep = 'idle' | 'email-input' | 'otp-verification' | 'mfa-required' | 'authenticated';

interface AuthState {
  currentStep: AuthenticationStep;
  email: string;
  isProcessing: boolean;
  lastError: string | null;
  otpDelivered: boolean;
}

export const useDynamicAuth = () => {
  const { user, primaryWallet, handleLogOut, sdkHasLoaded } = useDynamicContext();
  const { connectWithEmail, verifyOneTimePassword } = useConnectWithOtp();
  const { getUserDevices } = useMfa();
  
  const [mfaEnabled, setMfaEnabled] = useState(false);

  const [authState, setAuthState] = useState<AuthState>({
    currentStep: 'idle',
    email: '',
    isProcessing: false,
    lastError: null,
    otpDelivered: false,
  });

  // Email OTP Request Handler
  const initiateEmailAuthentication = useCallback(
    async (emailAddress: string): Promise<void> => {
      if (!emailAddress?.trim()) {
        const error = 'Email address is required';
        setAuthState(prev => ({ ...prev, lastError: error }));
        toast.error(error);
        return;
      }

      setAuthState(prev => ({
        ...prev,
        isProcessing: true,
        lastError: null,
        email: emailAddress,
      }));

      try {
        await connectWithEmail(emailAddress);

        setAuthState(prev => ({
          ...prev,
          currentStep: 'otp-verification',
          otpDelivered: true,
          isProcessing: false,
        }));

        toast.success(`Verification code sent to ${emailAddress}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Email authentication failed';
        
        setAuthState(prev => ({
          ...prev,
          lastError: errorMessage,
          isProcessing: false,
          otpDelivered: false,
        }));

        toast.error(errorMessage);
        throw err;
      }
    },
    [connectWithEmail]
  );

  // OTP Verification Handler
  const confirmVerificationCode = useCallback(
    async (code: string): Promise<void> => {
      if (!code || code.length < 4) {
        const error = 'Please enter a valid verification code';
        setAuthState(prev => ({ ...prev, lastError: error }));
        toast.error(error);
        return;
      }

      setAuthState(prev => ({ ...prev, isProcessing: true, lastError: null }));

      try {
        await verifyOneTimePassword(code);
        
        setAuthState(prev => ({
          ...prev,
          isProcessing: false,
          currentStep: 'authenticated',
        }));

        toast.success('Successfully authenticated!');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Verification failed';
        
        setAuthState(prev => ({
          ...prev,
          lastError: errorMessage,
          isProcessing: false,
        }));

        toast.error(errorMessage);
        throw err;
      }
    },
    [verifyOneTimePassword]
  );

  // Resend OTP Handler
  const requestNewCode = useCallback(async (): Promise<void> => {
    const { email } = authState;

    if (!email) {
      toast.error('No email address found. Please start over.');
      return;
    }

    setAuthState(prev => ({ ...prev, isProcessing: true, lastError: null }));

    try {
      await connectWithEmail(email);
      toast.success('New verification code sent');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend code';
      setAuthState(prev => ({ ...prev, lastError: errorMessage }));
      toast.error(errorMessage);
    } finally {
      setAuthState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [authState.email, connectWithEmail]);

  // Logout Handler
  const terminateSession = useCallback(async (): Promise<void> => {
    try {
      await handleLogOut();

      // Note: We do NOT clear signature history on logout - it persists per user
      // Only session/auth data is cleared by Dynamic SDK

      setAuthState({
        currentStep: 'idle',
        email: '',
        isProcessing: false,
        lastError: null,
        otpDelivered: false,
      });

      toast.success('Session ended successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      toast.error(errorMessage);
      console.error('Logout error:', err);
    }
  }, [handleLogOut]);

  // Reset Authentication Flow
  const resetAuthFlow = useCallback(() => {
    setAuthState({
      currentStep: 'idle',
      email: '',
      isProcessing: false,
      lastError: null,
      otpDelivered: false,
    });
  }, []);

  // Check MFA status - refresh when user changes
  useEffect(() => {
    const checkMFAStatus = async () => {
      if (user && sdkHasLoaded) {
        try {
          const devices = await getUserDevices();
          const hasMFA = devices.length > 0;
          setMfaEnabled(hasMFA);
          
          // Log for debugging
          if (hasMFA) {
            console.log('MFA is enabled with', devices.length, 'device(s)');
          }
        } catch (error) {
          console.error('Error checking MFA status:', error);
          // Don't set to false on error - might be a temporary issue
          // Only set to false if we're sure there's no user
          if (!user) {
            setMfaEnabled(false);
          }
        }
      } else {
        setMfaEnabled(false);
      }
    };

    // Small delay to ensure SDK is fully initialized
    const timeoutId = setTimeout(checkMFAStatus, 100);
    return () => clearTimeout(timeoutId);
  }, [user, sdkHasLoaded, getUserDevices]);

  // Sync authentication state with Dynamic context
  useEffect(() => {
    if (!sdkHasLoaded) return;

    if (user && primaryWallet) {
      setAuthState(prev => ({
        ...prev,
        currentStep: 'authenticated',
        email: user.email || prev.email,
      }));
    } else if (user && !primaryWallet) {
      setAuthState(prev => ({
        ...prev,
        currentStep: 'mfa-required',
      }));
    } else if (authState.currentStep === 'authenticated') {
      // User logged out externally
      setAuthState({
        currentStep: 'idle',
        email: '',
        isProcessing: false,
        lastError: null,
        otpDelivered: false,
      });
    }
  }, [user, primaryWallet, sdkHasLoaded]);

  // Computed values
  const isFullyAuthenticated = Boolean(user && primaryWallet);
  const requiresMFA = Boolean(user && !primaryWallet);
  const canResendCode = authState.otpDelivered && !authState.isProcessing;

  return {
    // State
    authenticationStep: authState.currentStep,
    emailAddress: authState.email,
    isLoading: authState.isProcessing || !sdkHasLoaded,
    errorMessage: authState.lastError,
    hasDeliveredOtp: authState.otpDelivered,
    
    // User & Wallet
    currentUser: user,
    connectedWallet: primaryWallet,
    sessionToken: null, // Not available in Dynamic SDK context
    
    // Status Flags
    isAuthenticated: isFullyAuthenticated,
    needsMFA: requiresMFA,
    canResend: canResendCode,
    mfaEnabled,
    
    // Actions
    login: initiateEmailAuthentication,
    verifyCode: confirmVerificationCode,
    resendCode: requestNewCode,
    logout: terminateSession,
    reset: resetAuthFlow,
  };
};