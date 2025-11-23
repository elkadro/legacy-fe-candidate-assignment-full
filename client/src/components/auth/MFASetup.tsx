import React, { useState, useEffect, useRef } from 'react';
import { Shield, Copy, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { useMfa } from '@dynamic-labs/sdk-react-core';
import QRCodeUtil from 'qrcode';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import toast from 'react-hot-toast';

interface MFASetupProps {
  onClose: () => void;
  onSuccess?: () => void;
}

type MfaRegisterData = {
  uri: string;
  secret: string;
};

const MFASetup: React.FC<MFASetupProps> = ({ onClose, onSuccess }) => {
  const [currentView, setCurrentView] = useState<'loading' | 'qr-code' | 'otp' | 'backup-codes' | 'already-enabled'>('loading');
  const [mfaRegisterData, setMfaRegisterData] = useState<MfaRegisterData | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    addDevice,
    authDevice,
    getRecoveryCodes,
    completeAcknowledgement,
    getUserDevices,
  } = useMfa();

  useEffect(() => {
    checkExistingDevices();
  }, []);

  const checkExistingDevices = async () => {
    try {
      setError(undefined);
      setCurrentView('loading');
      
      // Check if user already has MFA devices
      const devices = await getUserDevices();
      
      if (devices.length > 0) {
        // MFA is already enabled
        setCurrentView('already-enabled');
        // Silent - no toast, just auto-close
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
        return;
      }
      
      // No devices found, proceed with setup
      await initiateMFASetup();
    } catch (err: any) {
      console.error('Error checking MFA devices:', err);
      // If error checking devices, try to proceed with setup anyway
      await initiateMFASetup();
    }
  };

  // Generate QR code when data is available
  useEffect(() => {
    if (mfaRegisterData && canvasRef.current && currentView === 'qr-code') {
      QRCodeUtil.toCanvas(
        canvasRef.current,
        mfaRegisterData.uri,
        { width: 256 },
        (error) => {
          if (error) {
            console.error('QR Code generation error:', error);
            setError('Failed to generate QR code');
          }
        }
      );
    }
  }, [mfaRegisterData, currentView]);

  const initiateMFASetup = async () => {
    try {
      setError(undefined);
      setCurrentView('loading');

      // Check again before adding device (in case devices were added between checks)
      const devices = await getUserDevices();
      if (devices.length > 0) {
        setCurrentView('already-enabled');
        // Silent - no toast
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
        return;
      }

      // Add device and get QR code data
      const { uri, secret } = await addDevice();
      setMfaRegisterData({ uri, secret });
      setCurrentView('qr-code');
    } catch (err: any) {
      console.error('MFA setup error:', err);
      
      // Handle the "multiple devices not supported" error
      if (err.message?.includes('Multiple MFA devices') || err.message?.includes('not yet supported')) {
        setError('MFA is already enabled on your account. Multiple devices are not yet supported.');
        setCurrentView('already-enabled');
        // Silent - no toast
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
        return;
      }
      
      setError(err.message || 'Failed to initialize MFA setup');
      // Silent - no toast on error during setup
    }
  };

  const handleCopySecret = () => {
    if (mfaRegisterData?.secret) {
      navigator.clipboard.writeText(mfaRegisterData.secret);
      setCopied(true);
      toast.success('Secret copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleQRCodeContinue = () => {
    setError(undefined);
    setCurrentView('otp');
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otpCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsSubmitting(true);
    setError(undefined);

    try {
      // Authenticate the device with the OTP
      await authDevice(otpCode);

      // Get recovery codes
      const codes = await getRecoveryCodes();
      setBackupCodes(codes);
      setCurrentView('backup-codes');
      toast.success('Device authenticated successfully!');
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Invalid verification code');
      setOtpCode('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcknowledgeBackupCodes = async () => {
    try {
      // Complete the MFA acknowledgement
      await completeAcknowledgement();
      toast.success('MFA enabled successfully!');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Acknowledgement error:', err);
      toast.error('Failed to complete MFA setup');
    }
  };

  const handleCopyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    toast.success('Backup codes copied to clipboard');
  };

  if (currentView === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <p className="text-slate-600">Checking MFA status...</p>
      </div>
    );
  }

  if (currentView === 'already-enabled') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                MFA Already Enabled
              </h3>
              <p className="text-sm text-slate-600">
                Your account already has multi-factor authentication enabled
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">MFA is Active</p>
              <p className="text-sm text-green-700 mt-1">
                Your account is already protected with multi-factor authentication. You can now sign messages securely.
              </p>
            </div>
          </div>
        </div>

        <Button className="w-full" onClick={() => { onSuccess?.(); onClose(); }}>
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              Enable Two-Factor Authentication
            </h3>
            <p className="text-sm text-slate-600">
              Add an extra layer of security to your account
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* QR Code View */}
      {currentView === 'qr-code' && mfaRegisterData && (
        <div className="space-y-6">
          <div className="bg-slate-50 rounded-xl p-6 space-y-4">
            <p className="text-sm text-slate-700 font-medium">
              Step 1: Scan this QR code with your authenticator app
            </p>
            <p className="text-xs text-slate-600">
              Use Google Authenticator, Authy, or any TOTP-compatible app
            </p>
            <div className="flex justify-center bg-white p-4 rounded-lg">
              <canvas ref={canvasRef} />
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-6 space-y-4">
            <p className="text-sm text-slate-700 font-medium">
              Step 2: Or enter this code manually
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white px-4 py-3 rounded-lg font-mono text-sm border border-slate-200 break-all">
                {mfaRegisterData.secret}
              </code>
              <Button variant="outline" size="sm" onClick={handleCopySecret}>
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <Button className="w-full" onClick={handleQRCodeContinue}>
            Continue to Verification
          </Button>
        </div>
      )}

      {/* OTP View */}
      {currentView === 'otp' && (
        <form onSubmit={handleOTPSubmit} className="space-y-6">
          <div className="bg-slate-50 rounded-xl p-6 space-y-4">
            <p className="text-sm text-slate-700 font-medium">
              Step 3: Enter the 6-digit code from your authenticator app
            </p>
            <Input
              type="text"
              placeholder="000000"
              value={otpCode}
              onChange={(e: any) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center text-2xl tracking-widest font-mono"
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setCurrentView('qr-code')}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={otpCode.length !== 6 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Continue'
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Backup Codes View */}
      {currentView === 'backup-codes' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Save your backup codes!</p>
                <p className="mt-1">
                  Store these codes in a safe place. You can use them to access your account if you lose your device.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-700 font-medium">Your Backup Codes</p>
              <Button variant="outline" size="sm" onClick={handleCopyBackupCodes}>
                <Copy className="w-4 h-4 mr-2" />
                Copy All
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {backupCodes.map((code, index) => (
                <code
                  key={index}
                  className="bg-white px-4 py-2 rounded-lg font-mono text-sm border border-slate-200 text-center"
                >
                  {code}
                </code>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={handleAcknowledgeBackupCodes}>
            I've Saved My Backup Codes
          </Button>
        </div>
      )}
    </div>
  );
};

export default MFASetup;