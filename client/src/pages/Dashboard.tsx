import React, { useState, useEffect } from 'react';
import { LogOut, Shield, History, AlertCircle } from 'lucide-react';
import { useDynamicAuth } from '@hooks/useDynamicAuth';
import WalletInfo from '@components/wallet/WalletInfo';
import MessageSigner from '@components/signer/MessageSigner';
import SignatureHistory from '@components/signer/SignatureHistory';
import MFASetup from '@components/auth/MFASetup';
import Button from '@components/ui/Button';
import Card from '@components/ui/Card';
import storageService from '@services/storage.service';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { logout, currentUser, mfaEnabled, isLoading } = useDynamicAuth();
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [hasShownMfaWarning, setHasShownMfaWarning] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [hasCheckedNewUser, setHasCheckedNewUser] = useState(false);
  
  // Track initial mount to avoid showing notifications during login
  useEffect(() => {
    // After a short delay, mark that initial mount is complete
    const timer = setTimeout(() => {
      setIsInitialMount(false);
    }, 2000); // 2 second delay to let login flow complete
    
    return () => clearTimeout(timer);
  }, []);

  // Check if user is new (just signed up) and enforce MFA
  useEffect(() => {
    // Wait for auth to finish loading and initial mount to complete
    if (isLoading || isInitialMount || hasCheckedNewUser) return;
    
    if (!currentUser?.email) return;
    
    const email = currentUser.email;
    const hasLoggedInBefore = storageService.getForUser<boolean>('user_has_logged_in', email);
    const hasSignatureHistory = storageService.getForUser('signature_history', email);
    
    // User is new if they haven't logged in before and have no signature history
    const isNewUser = !hasLoggedInBefore && (!hasSignatureHistory || (Array.isArray(hasSignatureHistory) && hasSignatureHistory.length === 0));
    
    if (!mfaEnabled && !showMFASetup && !hasShownMfaWarning) {
      // If new user and MFA not enabled, show error toast
      if (isNewUser) {
        toast.error('Multi-factor authentication is required. Please set up MFA to continue.');
      }
      // Show setup modal for both new and existing users
      setShowMFASetup(true);
      setHasShownMfaWarning(true);
    }
    
    setHasCheckedNewUser(true);
  }, [currentUser, mfaEnabled, isLoading, hasShownMfaWarning, showMFASetup, isInitialMount, hasCheckedNewUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1280px' }}>
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SignVault
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {!mfaEnabled ? (
                <Button
                  variant="outline"
                  onClick={() => setShowMFASetup(true)}
                  className="hidden sm:flex border-amber-300 text-amber-700 hover:bg-amber-50 text-xs sm:text-sm"
                  size="sm"
                >
                  <Shield className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Setup Required</span>
                  <span className="sm:hidden">MFA</span>
                </Button>
              ) : (
                <div className="hidden sm:flex items-center gap-2 text-green-600 text-sm px-3 py-1.5 bg-green-50 rounded-lg">
                  <Shield className="w-4 h-4" />
                  <span>MFA Enabled</span>
                </div>
              )}
              
              <Button
                variant="outline"
                onClick={() => setShowHistory(!showHistory)}
                className="hidden md:flex"
                size="sm"
              >
                <History className="w-4 h-4 mr-2" />
                {showHistory ? 'Hide' : 'Show'} History
              </Button>

              <Button variant="ghost" onClick={logout} size="sm" className="text-xs sm:text-sm">
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full" style={{ maxWidth: '1280px' }}>
        {/* MFA Required Banner */}
        {!mfaEnabled && currentUser && (
          <Card variant="outlined" className="mb-6 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-amber-900 mb-1">
                  Multi-Factor Authentication Required
                </h3>
                <p className="text-sm text-amber-800">
                  For your security, MFA is mandatory. Please set up two-factor authentication to access all features.
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Wallet Info */}
            <WalletInfo />

            {/* Message Signer - Only show if MFA is enabled */}
            {mfaEnabled ? (
              <MessageSigner />
            ) : (
              <Card className="opacity-50 pointer-events-none">
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Shield className="w-12 h-12 text-slate-400" />
                  <h3 className="text-lg font-semibold text-slate-600">
                    Enable MFA to Sign Messages
                  </h3>
                  <p className="text-sm text-slate-500 text-center max-w-sm">
                    Multi-factor authentication must be enabled before you can sign messages.
                  </p>
                </div>
              </Card>
            )}

            {/* MFA Setup Modal - Only show if MFA is not enabled */}
            {showMFASetup && !mfaEnabled && (
              <Card variant="elevated" className="animate-slide-up border-amber-300">
                <MFASetup 
                  onClose={() => {
                    if (mfaEnabled) {
                      setShowMFASetup(false);
                      setHasShownMfaWarning(false);
                    }
                    // Silent - no toast on close if MFA not enabled
                  }}
                  onSuccess={() => {
                    setShowMFASetup(false);
                    setHasShownMfaWarning(false);
                    // Silent - no toast on success
                  }}
                />
              </Card>
            )}
          </div>

          {/* Right Column - History */}
          {showHistory && (
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <SignatureHistory />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;