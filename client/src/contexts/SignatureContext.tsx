import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SignatureHistoryItem } from '../types/signature.types';
import storageService from '@services/storage.service';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

interface SignatureContextType {
  history: SignatureHistoryItem[];
  addSignature: (item: SignatureHistoryItem) => void;
  updateSignature: (id: string, updates: Partial<SignatureHistoryItem>) => void;
  clearHistory: () => void;
  removeSignature: (id: string) => void;
}

const SignatureContext = createContext<SignatureContextType | undefined>(undefined);

const STORAGE_KEY = 'signature_history';

export const SignatureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useDynamicContext();
  const [history, setHistory] = useState<SignatureHistoryItem[]>([]);
  const currentEmail = user?.email || null;

  // Load history from localStorage when user changes
  useEffect(() => {
    if (!currentEmail) {
      setHistory([]);
      return;
    }

    // Try to load from email-specific key first
    let savedHistory = storageService.getForUser<SignatureHistoryItem[]>(
      STORAGE_KEY,
      currentEmail
    );

    // If no email-specific data found, try to migrate from old format (backward compatibility)
    if (!savedHistory || !Array.isArray(savedHistory) || savedHistory.length === 0) {
      const oldHistory = storageService.get<SignatureHistoryItem[]>(STORAGE_KEY);
      if (oldHistory && Array.isArray(oldHistory) && oldHistory.length > 0) {
        // Migrate old data to email-specific key
        console.log(`Migrating ${oldHistory.length} signature(s) for ${currentEmail}`);
        savedHistory = oldHistory;
        storageService.setForUser(STORAGE_KEY, currentEmail, oldHistory);
        // Remove old key to avoid confusion
        storageService.remove(STORAGE_KEY);
      }
    }

    if (savedHistory && Array.isArray(savedHistory)) {
      console.log(`Loaded ${savedHistory.length} signature(s) for ${currentEmail}`);
      setHistory(savedHistory);
    } else {
      setHistory([]);
    }
  }, [currentEmail]);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    // Only save if we have an email (user is logged in)
    if (currentEmail && history.length > 0) {
      const userKey = storageService.getUserKey(STORAGE_KEY, currentEmail);
      console.log(`Saving ${history.length} signature(s) for ${currentEmail} (key: ${userKey})`);
      storageService.setForUser(STORAGE_KEY, currentEmail, history);
    }
  }, [history, currentEmail]);

  const addSignature = useCallback((item: SignatureHistoryItem) => {
    setHistory(prev => [item, ...prev]);
  }, []);

  const updateSignature = useCallback((id: string, updates: Partial<SignatureHistoryItem>) => {
    setHistory(prev =>
      prev.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }, []);

  const removeSignature = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    if (currentEmail) {
      storageService.removeForUser(STORAGE_KEY, currentEmail);
    }
  }, [currentEmail]);

  return (
    <SignatureContext.Provider
      value={{
        history,
        addSignature,
        updateSignature,
        clearHistory,
        removeSignature,
      }}
    >
      {children}
    </SignatureContext.Provider>
  );
};

export const useSignatureContext = () => {
  const context = useContext(SignatureContext);
  if (!context) {
    throw new Error('useSignatureContext must be used within SignatureProvider');
  }
  return context;
};

