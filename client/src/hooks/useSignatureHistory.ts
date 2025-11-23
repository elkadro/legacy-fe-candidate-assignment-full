import { useState, useEffect, useCallback } from 'react';
import { SignatureHistoryItem } from '../types/signature.types';
import storageService from '../services/storage.service';

const MAX_RECORDS = 50;
const STORAGE_KEY = 'signature_history';
const STORAGE_SYNC_DELAY = 300; // debounce writes

export const useSignatureHistory = () => {
  const [records, setRecords] = useState<SignatureHistoryItem[]>([]);
  const [pendingSync, setPendingSync] = useState(false);

  // Initialize from storage on mount
  useEffect(() => {
    const loadPersistedRecords = () => {
      try {
        const stored = storageService.get<SignatureHistoryItem[]>(STORAGE_KEY);
        setRecords(stored || []);
      } catch (err) {
        console.error('Failed to load signature history:', err);
        setRecords([]);
      }
    };

    loadPersistedRecords();
  }, []);

  // Debounced sync to storage
  useEffect(() => {
    if (!pendingSync || records.length === 0) return;

    const syncTimeout = setTimeout(() => {
      // Save all records at once
      const trimmed = records.slice(0, MAX_RECORDS);
      storageService.set(STORAGE_KEY, trimmed);
      setPendingSync(false);
    }, STORAGE_SYNC_DELAY);

    return () => clearTimeout(syncTimeout);
  }, [records, pendingSync]);

  // Add new signature record
  const addSignature = useCallback((newRecord: SignatureHistoryItem) => {
    setRecords((current) => {
      // Check for duplicates by signature
      const isDuplicate = current.some(
        (item) => item.signature === newRecord.signature
      );

      if (isDuplicate) {
        console.warn('Duplicate signature detected, skipping');
        return current;
      }

      // Add to front and enforce limit
      const updated = [newRecord, ...current].slice(0, MAX_RECORDS);
      
      // Trigger storage sync
      setPendingSync(true);
      
      return updated;
    });
  }, []);

  // Modify existing record
  const updateSignature = useCallback(
    (recordId: string, modifications: Partial<SignatureHistoryItem>) => {
      setRecords((current) => {
        const recordExists = current.some((item) => item.id === recordId);
        
        if (!recordExists) {
          console.warn(`Record ${recordId} not found`);
          return current;
        }

        const updated = current.map((item) =>
          item.id === recordId ? { ...item, ...modifications } : item
        );

        // Trigger storage sync
        setPendingSync(true);

        return updated;
      });
    },
    []
  );

  // Remove specific record
  const deleteSignature = useCallback((recordId: string) => {
    setRecords((current) => {
      const filtered = current.filter((item) => item.id !== recordId);
      
      // Trigger storage sync
      setPendingSync(true);
      
      return filtered;
    });
  }, []);

  // Remove all records
  const clearHistory = useCallback(() => {
    setRecords([]);
    storageService.remove(STORAGE_KEY);
  }, []);

  // Find specific record
  const findById = useCallback(
    (recordId: string): SignatureHistoryItem | undefined => {
      return records.find((item) => item.id === recordId);
    },
    [records]
  );

  // Get records by verification status
  const getVerifiedRecords = useCallback(() => {
    return records.filter((item) => item.verified === true);
  }, [records]);

  const getUnverifiedRecords = useCallback(() => {
    return records.filter((item) => !item.verificationResult);
  }, [records]);

  // Export records as JSON
  const exportAsJson = useCallback(() => {
    const dataStr = JSON.stringify(records, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `signature-history-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [records]);

  // Statistics
  const stats = {
    total: records.length,
    verified: records.filter((r) => r.verified).length,
    unverified: records.filter((r) => !r.verificationResult).length,
    failed: records.filter((r) => r.verified === false).length,
  };

  return {
    // Data
    history: records,
    
    // CRUD Operations
    addSignature,
    updateSignature,
    deleteSignature,
    clearHistory,
    
    // Queries
    findById,
    getVerifiedRecords,
    getUnverifiedRecords,
    
    // Utils
    exportAsJson,
    stats,
    
    // State
    isSyncing: pendingSync,
  };
};