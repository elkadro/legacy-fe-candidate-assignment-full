import { useState, useCallback } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import apiService from '@services/api.service';
import { VerificationResult } from '../types/signature.types';

export const useMessageSigner = () => {
  const { primaryWallet } = useDynamicContext();
  const [isSigningLoading, setIsSigning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!primaryWallet) {
      throw new Error('No wallet connected');
    }

    setIsSigning(true);
    try {
      // Dynamic SDK: Use primaryWallet's signMessage method directly (for embedded wallets)
      if (primaryWallet.signMessage && typeof primaryWallet.signMessage === 'function') {
        const signature = await primaryWallet.signMessage(message);
        if (!signature) {
          throw new Error('Failed to get signature from wallet');
        }
        toast.success('Message signed successfully!');
        return signature;
      }

      // Fallback: Use connector to get provider and create ethers signer
      const connector = primaryWallet.connector as any;
      
      // Try to get provider from connector
      let provider = connector.getPublicClient?.() || connector.getProvider?.();
      
      // If no provider method, try to get signer directly
      if (connector.getSigner && typeof connector.getSigner === 'function') {
        try {
          const signer = await connector.getSigner();
          if (signer && signer.signMessage) {
            const signature = await signer.signMessage(message);
            toast.success('Message signed successfully!');
            return signature;
          }
        } catch (signerError) {
          console.warn('Failed to get signer from connector:', signerError);
        }
      }
      
      // If no provider yet, try RPC URL
      if (!provider && connector.rpcUrl) {
        provider = new ethers.JsonRpcProvider(connector.rpcUrl);
      }
      
      if (!provider) {
        throw new Error('Unable to get provider from wallet. Please ensure your wallet is properly connected.');
      }
      
      // Create ethers provider and signer
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const signature = await signer.signMessage(message);
      
      toast.success('Message signed successfully!');
      return signature;
    } catch (error: any) {
      console.error('Sign message error:', error);
      toast.error(error.message || 'Failed to sign message');
      throw error;
    } finally {
      setIsSigning(false);
    }
  }, [primaryWallet]);

  const verifySignature = useCallback(
    async (message: string, signature: string): Promise<VerificationResult> => {
      if (!primaryWallet?.address) {
        throw new Error('No wallet address available for verification');
      }

      setIsVerifying(true);
      try {
        const result = await apiService.verifySignature(message, signature, primaryWallet.address);
        // Don't show toasts here - let the caller handle them to avoid duplicates
        return result;
      } catch (error: any) {
        // Don't show toast here - let the caller handle it
        throw error;
      } finally {
        setIsVerifying(false);
      }
    },
    [primaryWallet]
  );

  return {
    signMessage,
    verifySignature,
    isSigningLoading,
    isVerifying,
  };
};
