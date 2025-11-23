import React, { useState } from 'react';
import { Send, Loader2, FileSignature } from 'lucide-react';
import { useMessageSigner } from '@hooks/useMessageSigner';
import { useSignatureContext } from '@contexts/SignatureContext';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import VerificationResult from './VerificationResult';
import { SignatureHistoryItem, VerificationResult as VerificationResultType } from '../../types/signature.types';
import toast from 'react-hot-toast';

const MessageSigner: React.FC = () => {
  const [message, setMessage] = useState('');
  const [currentResult, setCurrentResult] = useState<VerificationResultType | null>(null);
  const { signMessage, verifySignature, isSigningLoading, isVerifying } = useMessageSigner();
  const { addSignature, updateSignature } = useSignatureContext();
  const { primaryWallet } = useDynamicContext();

  const handleSignAndVerify = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (message.length > 500) {
      toast.error('Message cannot exceed 500 characters');
      return;
    }

    if (!primaryWallet) {
      toast.error('No wallet connected');
      return;
    }

    try {
      // Step 1: Sign the message
      const signature = await signMessage(message);

      // Create history item
      const historyItem: SignatureHistoryItem = {
        id: Date.now().toString(),
        message,
        signature,
        timestamp: Date.now(),
      };

      addSignature(historyItem);

      // Step 2: Verify the signature via backend
      const result = await verifySignature(message, signature);
      
      setCurrentResult(result);

      // Update history with verification result
      updateSignature(historyItem.id, {
        verified: result.isValid,
        verificationResult: result,
      });

      // Show toast for verification result (only in MessageSigner, not in history re-verification)
      if (result.isValid) {
        toast.success('Signature verified!');
      } else {
        toast.error('Invalid signature');
      }

      // Clear form
      setMessage('');
    } catch (error: any) {
      console.error('Sign and verify error:', error);
      // Extract actual error message from API response
      const errorMessage = 
        error?.response?.data?.message || 
        error?.response?.data?.error || 
        error?.message || 
        'Failed to sign message';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card variant="elevated" className="animate-slide-up">
        <div className="space-y-5">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <FileSignature className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">Sign Message</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Enter a custom message to sign cryptographically
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Message
                </label>
                <span className={`text-xs ${message.length > 500 ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                  {message.length}/500
                </span>
              </div>
              <textarea
                value={message}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue.length <= 500) {
                    setMessage(newValue);
                  }
                }}
                placeholder="Enter your message here..."
                rows={5}
                maxLength={500}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all text-sm sm:text-base bg-slate-50 focus:bg-white ${
                  message.length > 500 ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'
                }`}
                disabled={isSigningLoading || isVerifying}
              />
              {message.length > 500 && (
                <p className="text-xs text-red-600 mt-1">Message cannot exceed 500 characters</p>
              )}
            </div>

            <Button
              onClick={handleSignAndVerify}
              disabled={!message.trim() || isSigningLoading || isVerifying}
              className="w-full"
            >
              {isSigningLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing Message...
                </>
              ) : isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying Signature...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Sign & Verify Message
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {currentResult && (
        <VerificationResult result={currentResult} onClose={() => setCurrentResult(null)} />
      )}
    </div>
  );
};

export default MessageSigner;