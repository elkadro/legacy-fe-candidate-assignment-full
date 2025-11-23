import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { useDynamicAuth } from '@hooks/useDynamicAuth';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import LoadingOverlay from '@components/ui/LoadingOverlay';
import storageService from '@services/storage.service';
import toast from 'react-hot-toast';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { 
    login, 
    verifyCode, 
    resendCode, 
    isLoading, 
    hasDeliveredOtp, 
    canResend,
    errorMessage,
    isAuthenticated
  } = useDynamicAuth();


  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    try {
      await login(email);
    } catch (error: any) {
      // Error is handled by the hook
      console.error('Login error:', error);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpCode || otpCode.length < 4) {
      toast.error('Please enter a valid verification code');
      return;
    }

    // Mark that verify button was clicked
    setIsVerifying(true);

    try {
      await verifyCode(otpCode);
    } catch (error: any) {
      // Error is handled by the hook
      setIsVerifying(false); // Reset on error
      console.error('OTP verification error:', error);
    }
  };

  // Reset verifying state when authenticated and mark user as having logged in
  useEffect(() => {
    if (isAuthenticated && email) {
      setIsVerifying(false);
      // Mark that this user has logged in before (for future logins)
      storageService.setForUser('user_has_logged_in', email, true);
    }
  }, [isAuthenticated, email]);

  // Show loading overlay after verify button is clicked and until fully authenticated
  const showOverlay = isVerifying && !isAuthenticated;
  const overlayMessage = 'Signing you in...';

  // Show OTP input if code has been delivered
  if (hasDeliveredOtp) {
    return (
      <>
        <LoadingOverlay show={showOverlay} message={overlayMessage} />
        <div className={`space-y-5 sm:space-y-6 ${showOverlay ? 'pointer-events-none' : ''}`}>
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Verify Your Email</h2>
          <p className="text-sm sm:text-base text-slate-600">
            Enter the verification code sent to <br className="hidden sm:block" />
            <span className="font-semibold text-slate-800 break-all sm:break-normal">{email}</span>
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleOTPSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="000000"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            required
            disabled={isLoading}
            autoComplete="one-time-code"
            className="text-center text-2xl tracking-widest font-mono"
            autoFocus
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || otpCode.length < 4}
            isLoading={isLoading}
          >
            Verify Code
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {canResend && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => resendCode()}
                className="text-sm text-primary-600 hover:text-primary-700 underline"
                disabled={isLoading}
              >
                Resend code
              </button>
            </div>
          )}
        </form>

        <div className="pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-xs text-center text-slate-500 hover:text-slate-700 underline w-full"
          >
            Use a different email
          </button>
        </div>
      </div>
      </>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Welcome Back</h2>
        <p className="text-sm sm:text-base text-slate-600">
          Sign in with your email to access your wallet
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={Mail}
          required
          disabled={isLoading}
          autoComplete="email"
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !email}
          isLoading={isLoading}
        >
          Continue with Email
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>

      <div className="pt-4 border-t border-slate-200">
        <p className="text-xs text-center text-slate-500">
          Powered by Dynamic.xyz
          <br />
          Secure email-based Web3 authentication
        </p>
      </div>
    </div>
  );
};

export default LoginForm;