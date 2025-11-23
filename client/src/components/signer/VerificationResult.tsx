import React from 'react';
import { CheckCircle2, XCircle, Copy, Check, X } from 'lucide-react';
import { VerificationResult as VerificationResultType } from '../../types/signature.types';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import toast from 'react-hot-toast';

interface VerificationResultProps {
  result: VerificationResultType;
  onClose: () => void;
}

const VerificationResult: React.FC<VerificationResultProps> = ({ result, onClose }) => {
  const [copied, setCopied] = React.useState<string | null>(null);

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      toast.success(`${label} copied!`);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card variant="elevated" className="animate-slide-up border-2 border-slate-200">
      <div className="space-y-4 sm:space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {result.isValid ? (
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                {result.isValid ? 'Signature Verified' : 'Signature Invalid'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                {result.isValid
                  ? 'The signature is valid and matches the signer'
                  : 'The signature could not be verified'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Status Badge */}
        <div
          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            result.isValid
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {result.isValid ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Valid Signature
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 mr-2" />
              Invalid Signature
            </>
          )}
        </div>

        {/* Details */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
          {/* Signer Address */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Signer Address
              </label>
              <button
                onClick={() => handleCopy(result.signer, 'Address')}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 transition-colors"
              >
                {copied === 'Address' ? (
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
            <div className="bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-slate-200">
              <code className="text-xs sm:text-sm font-mono text-slate-900 break-all sm:break-normal">
                {formatAddress(result.signer)}
              </code>
            </div>
            <div className="mt-1">
              <code className="text-xs font-mono text-slate-500 break-all">
                {result.signer}
              </code>
            </div>
          </div>

          {/* Original Message */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Original Message
              </label>
              <button
                onClick={() => handleCopy(result.originalMessage, 'Message')}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 transition-colors"
              >
                {copied === 'Message' ? (
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
            <div className="bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-slate-200">
              <p className="text-xs sm:text-sm text-slate-900 break-words whitespace-pre-wrap">
                {result.originalMessage}
              </p>
            </div>
          </div>

          {/* Timestamp */}
          {result.timestamp && (
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide block mb-2">
                Verified At
              </label>
              <div className="bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-slate-200">
                <p className="text-xs sm:text-sm text-slate-600">
                  {new Date(result.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default VerificationResult;

