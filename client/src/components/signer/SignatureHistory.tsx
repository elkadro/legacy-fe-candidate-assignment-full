import React, { useState } from 'react';
import { History, CheckCircle2, XCircle, ChevronDown, ChevronUp, Trash2, RotateCw, Copy, Check } from 'lucide-react';
import { SignatureHistoryItem } from '@/types/signature.types';
import { useSignatureContext } from '@/contexts/SignatureContext';
import { useMessageSigner } from '@/hooks/useMessageSigner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

const SignatureHistory: React.FC = () => {
  const { history, updateSignature, clearHistory } = useSignatureContext();
  const { verifySignature } = useMessageSigner();
  
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [recentlyCopied, setRecentlyCopied] = useState<string | null>(null);
  const [verifyingItems, setVerifyingItems] = useState<Set<string>>(new Set());

  const handleExpandToggle = (itemId: string) => {
    setActiveItemId(current => current === itemId ? null : itemId);
  };

  const handleCopyToClipboard = async (content: string, label: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setRecentlyCopied(itemId);
      toast.success(`${label} copied!`);
      setTimeout(() => setRecentlyCopied(null), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleReVerification = async (item: SignatureHistoryItem) => {
    setVerifyingItems(prev => new Set(prev).add(item.id));
    
    try {
      const result = await verifySignature(item.message, item.signature);
      
      updateSignature(item.id, {
        verified: result.isValid,
        verificationResult: result,
      });

      if (result.isValid) {
        toast.success('Signature verified!');
      } else {
        toast.error('Signature invalid!');
      }
    } catch (err: any) {
      // Extract actual error message from API response
      const errorMessage = 
        err?.response?.data?.message || 
        err?.response?.data?.error || 
        err?.message || 
        'Verification failed';
      toast.error(errorMessage);
    } finally {
      setVerifyingItems(prev => {
        const updated = new Set(prev);
        updated.delete(item.id);
        return updated;
      });
    }
  };

  const handleBulkClear = () => {
    if (window.confirm(`Delete all ${history.length} signature records?`)) {
      clearHistory();
      toast.success('History cleared');
    }
  };

  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const abbreviateText = (text: string, maxLength: number = 60): string => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  const getStatusIcon = (item: SignatureHistoryItem) => {
    if (!item.verificationResult) {
      return <div className="w-5 h-5 rounded-full bg-slate-200 animate-pulse" />;
    }
    
    return item.verificationResult.isValid ? (
      <CheckCircle2 className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  if (history.length === 0) {
    return (
      <Card variant="elevated" className="h-full min-h-[400px]">
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <History className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2">
            No Signatures Yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 text-center max-w-xs">
            Sign your first message to see it appear here. All signatures are stored locally.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="h-full flex flex-col max-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 pb-4 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
            <History className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 truncate">Signature Log</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              {history.length} record{history.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <Button variant="outline" size="sm" onClick={handleBulkClear} className="flex-shrink-0 ml-2 cursor-pointer">
          <Trash2 className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Clear</span>
        </Button>
      </div>

      {/* History List */}
      <div className="space-y-3 overflow-y-auto flex-1 -mx-2 px-2">
        {history.map((item: any) => {
          const isExpanded = activeItemId === item.id;
          const isCurrentlyVerifying = verifyingItems.has(item.id);
          const wasCopied = recentlyCopied === item.id;

          return (
            <div
              key={item.id}
              className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200"
            >
              {/* Main Row */}
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(item)}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Timestamp & Status */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                      {formatRelativeTime(item.timestamp)}
                    </span>
                    {item.verificationResult && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                          item.verificationResult.isValid
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.verificationResult.isValid ? 'Verified' : 'Failed'}
                      </span>
                    )}
                  </div>

                  {/* Message Preview */}
                  <p className="text-sm text-slate-900 break-words mb-3">
                    {abbreviateText(item.message, 80)}
                  </p>
                </div>

                {/* Actions - Compact and Same Size */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleExpandToggle(item.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer flex-shrink-0"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleReVerification(item)}
                    disabled={isCurrentlyVerifying}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-purple-500 text-purple-700 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:border-purple-600 hover:text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-600 disabled:hover:bg-transparent disabled:hover:text-slate-600 flex-shrink-0"
                  >
                    {isCurrentlyVerifying ? (
                      <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                    ) : (
                      <RotateCw className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Details - Full Width */}
              {isExpanded && (
                <div className="space-y-4 mt-4 pt-4 border-t border-slate-200 relative left-0 right-0 -ml-3 -mr-3 sm:-ml-4 sm:-mr-4 px-3 sm:px-4 w-[calc(100%+1.5rem)] sm:w-[calc(100%+2rem)]">
                  {/* Full Message */}
                  <DetailSection
                    label="Message"
                    content={item.message}
                    onCopy={() => handleCopyToClipboard(item.message, 'Message', `${item.id}-msg`)}
                    isCopied={wasCopied}
                  />

                  {/* Signature */}
                  <DetailSection
                    label="Signature"
                    content={item.signature}
                    onCopy={() => handleCopyToClipboard(item.signature, 'Signature', `${item.id}-sig`)}
                    isCopied={wasCopied}
                    monospace
                  />

                  {/* Signer Address */}
                  {item.verificationResult?.signer && (
                    <DetailSection
                      label="Signer Address"
                      content={item.verificationResult.signer}
                      onCopy={() => handleCopyToClipboard(item.verificationResult!.signer, 'Address', `${item.id}-addr`)}
                      isCopied={wasCopied}
                      monospace
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// Helper Component for Detail Sections
const DetailSection: React.FC<{
  label: string;
  content: string;
  onCopy: () => void;
  isCopied?: boolean;
  monospace?: boolean;
}> = ({ label, content, onCopy, isCopied, monospace }) => (
  <div className="w-full">
    <div className="flex items-center justify-between mb-2">
      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex-shrink-0">
        {label}
      </label>
      <button
        onClick={onCopy}
        className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 transition-colors cursor-pointer flex-shrink-0 ml-2"
      >
        {isCopied ? (
          <>
            <Check className="w-3 h-3" />
            Copied
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" />
            Copy
          </>
        )}
      </button>
    </div>
    <div
      className={`bg-white p-3 rounded-lg border border-slate-200 text-sm text-slate-900 w-full break-words overflow-wrap-anywhere word-break-break-all ${
        monospace ? 'font-mono text-xs' : ''
      }`}
    >
      {content}
    </div>
  </div>
);

export default SignatureHistory;